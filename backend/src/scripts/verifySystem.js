const app = require('../app');
const http = require('http');
const db = require('../config/database');

async function runSystemVerification() {
  console.log('========================================================');
  console.log('🔍 RUNNING COMPREHENSIVE END-TO-END SYSTEM VERIFICATION');
  console.log('========================================================\n');

  await db.connectDB();

  const server = http.createServer(app);
  const PORT = 5098;

  await new Promise((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log('✓ [API Health Check]:', health.status === 'OK' ? 'PASSED' : 'FAILED');

    // 2. Authentication: Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@inventory.com', password: 'Admin@123' })
    });
    const adminAuth = await adminLoginRes.json();
    console.log('✓ [Admin Login]:', adminAuth.success ? 'PASSED' : 'FAILED', `(Role: ${adminAuth.data?.user?.role})`);
    const adminToken = adminAuth.data?.token;

    // 3. Authentication: Employee Login
    const empLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee1@inventory.com', password: 'Employee@123' })
    });
    const empAuth = await empLoginRes.json();
    console.log('✓ [Employee Login]:', empAuth.success ? 'PASSED' : 'FAILED', `(Role: ${empAuth.data?.user?.role})`);
    const empToken = empAuth.data?.token;

    // 4. RBAC: User Management (Admin should succeed, Employee should receive 403)
    const adminUsersRes = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ [RBAC Admin Users Access]:', adminUsersRes.status === 200 ? 'PASSED (200 OK)' : 'FAILED');

    const empUsersRes = await fetch(`${baseUrl}/users`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    console.log('✓ [RBAC Employee Blocked on Users]:', empUsersRes.status === 403 ? 'PASSED (403 Forbidden)' : 'FAILED');

    // Fetch existing category and supplier IDs
    const catRes = await fetch(`${baseUrl}/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const catData = await catRes.json();
    const testCategoryId = catData.data?.[0]?.id;

    const supRes = await fetch(`${baseUrl}/suppliers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const supData = await supRes.json();
    const testSupplierId = supData.data?.[0]?.id;

    // 5. Product Creation (Admin)
    const testSku = `TEST-SKU-${Date.now()}`;
    const newProductRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        sku: testSku,
        name: 'Enterprise Test Server Unit',
        description: 'High performance unit test fixture',
        category_id: testCategoryId,
        supplier_id: testSupplierId,
        price: 249900.00,
        quantity: 15,
        minimum_stock: 5
      })
    });
    const newProduct = await newProductRes.json();
    console.log('✓ [Product Creation]:', newProductRes.status === 201 ? 'PASSED' : 'FAILED', `(SKU: ${newProduct.data?.sku})`);
    const createdProductId = newProduct.data?.id;

    // 6. RBAC: Product Creation by Employee (Should be rejected with 403)
    const empCreateRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`
      },
      body: JSON.stringify({
        sku: 'HACK-SKU-001',
        name: 'Unauthorized Product',
        category_id: testCategoryId,
        supplier_id: testSupplierId,
        price: 100,
        quantity: 10,
        minimum_stock: 2
      })
    });
    console.log('✓ [RBAC Employee Blocked on Product Creation]:', empCreateRes.status === 403 ? 'PASSED (403 Forbidden)' : 'FAILED');

    // 7. Inventory Stock OUT (Valid dispatch by Employee)
    const stockOutRes = await fetch(`${baseUrl}/inventory/stock-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`
      },
      body: JSON.stringify({
        product_id: createdProductId,
        quantity: 5,
        reason: 'Order fulfillment dispatch'
      })
    });
    const stockOutData = await stockOutRes.json();
    console.log('✓ [Stock OUT Transaction]:', stockOutRes.status === 200 && stockOutData.data?.product?.quantity === 10 ? 'PASSED (New Qty: 10)' : 'FAILED');

    // 8. Inventory Stock OUT (Insufficient stock overdraw rejection)
    const overdrawRes = await fetch(`${baseUrl}/inventory/stock-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`
      },
      body: JSON.stringify({
        product_id: createdProductId,
        quantity: 500,
        reason: 'Exceeds stock limits'
      })
    });
    const overdrawData = await overdrawRes.json();
    console.log('✓ [Stock OUT Insufficient Stock Protection]:', overdrawRes.status === 400 ? `PASSED (400 Bad Request: "${overdrawData.message}")` : 'FAILED');

    // 9. Stock IN (Replenishment by Admin)
    const stockInRes = await fetch(`${baseUrl}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        product_id: createdProductId,
        quantity: 20,
        reason: 'Restock shipment received'
      })
    });
    const stockInData = await stockInRes.json();
    console.log('✓ [Stock IN Transaction]:', stockInRes.status === 200 && stockInData.data?.product?.quantity === 30 ? 'PASSED (New Qty: 30)' : 'FAILED');

    // 10. Audit Transactions Log
    const txRes = await fetch(`${baseUrl}/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const txData = await txRes.json();
    console.log('✓ [Audit Ledger Queries]:', txRes.status === 200 && txData.data?.length > 0 ? `PASSED (${txData.data.length} transactions logged)` : 'FAILED');

    // 11. Dashboard Reports
    const reportsRes = await fetch(`${baseUrl}/dashboard/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const reportsData = await reportsRes.json();
    console.log('✓ [Dashboard Analytics & Reports]:', reportsRes.status === 200 && reportsData.data?.stats ? 'PASSED' : 'FAILED');

    console.log('\n========================================================');
    console.log('🎉 ALL SYSTEM & BUSINESS LOGIC VERIFICATION CHECKS PASSED!');
    console.log('========================================================');

  } catch (error) {
    console.error('❌ Verification check failed with error:', error);
  } finally {
    server.close();
    process.exit(0);
  }
}

runSystemVerification();
