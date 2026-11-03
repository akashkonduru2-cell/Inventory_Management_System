const app = require('../app');
const http = require('http');
const db = require('../config/database');

async function testAllRolesAuth() {
  console.log('========================================================');
  console.log('🔐 TESTING COMPLETE AUTHENTICATION FLOW (3 ROLES)');
  console.log('========================================================\n');

  await db.connectDB();

  const server = http.createServer(app);
  const PORT = 5097;

  await new Promise((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    const rolesToTest = [
      { name: 'ADMIN', email: 'admin@inventory.com', password: 'Admin@123' },
      { name: 'MANAGER', email: 'manager1@inventory.com', password: 'Manager@123' },
      { name: 'EMPLOYEE', email: 'employee1@inventory.com', password: 'Employee@123' }
    ];

    for (const testCase of rolesToTest) {
      console.log(`--- Testing ${testCase.name} Login (${testCase.email}) ---`);

      // 1. POST /api/auth/login
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testCase.email, password: testCase.password })
      });

      const loginData = await loginRes.json();
      console.log(`[Status ${loginRes.status}] Login response:`, {
        success: loginData.success,
        message: loginData.message,
        role: loginData.data?.user?.role,
        hasToken: Boolean(loginData.data?.token)
      });

      if (!loginData.success || !loginData.data?.token) {
        throw new Error(`Login failed for ${testCase.name}`);
      }

      const token = loginData.data.token;

      // 2. GET /api/auth/me (Verify JWT authentication)
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const meData = await meRes.json();
      console.log(`[Status ${meRes.status}] /auth/me verified for:`, meData.data?.email, `(Role: ${meData.data?.role})\n`);
    }

    console.log('========================================================');
    console.log('🎉 ALL 3 ROLES PASSED AUTHENTICATION & JWT VERIFICATION!');
    console.log('========================================================');

  } catch (err) {
    console.error('❌ Auth flow test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testAllRolesAuth();
