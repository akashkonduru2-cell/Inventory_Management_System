const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

async function seedDatabase() {
  console.log('--- Seeding MongoDB Database ---');
  console.log(`Connecting to: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to MongoDB.');

    // 1. Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Transaction.deleteMany({})
    ]);
    console.log('✓ Cleared existing collections.');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const managerPassword = await bcrypt.hash('Manager@123', salt);
    const employeePassword = await bcrypt.hash('Employee@123', salt);

    const usersData = [
      { name: 'Admin User', email: 'admin@inventory.com', password: adminPassword, role: 'ADMIN', is_active: true },
      { name: 'Sarah Jenkins', email: 'manager1@inventory.com', password: managerPassword, role: 'MANAGER', is_active: true },
      { name: 'David Vance', email: 'manager2@inventory.com', password: managerPassword, role: 'MANAGER', is_active: true },
      { name: 'Alex Carter', email: 'employee1@inventory.com', password: employeePassword, role: 'EMPLOYEE', is_active: true },
      { name: 'Emma Watson', email: 'employee2@inventory.com', password: employeePassword, role: 'EMPLOYEE', is_active: true },
      { name: 'James Miller', email: 'employee3@inventory.com', password: employeePassword, role: 'EMPLOYEE', is_active: true }
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`✓ Seeded ${createdUsers.length} Users (1 Admin, 2 Managers, 3 Employees)`);

    // Map users by email for transaction references
    const userMap = {};
    createdUsers.forEach(u => {
      userMap[u.email] = u._id;
    });

    // 3. Seed Categories
    const categoriesData = [
      { name: 'Computers & Laptops', description: 'Desktop PCs, notebooks, laptops, workstations and server hardware' },
      { name: 'Computer Peripherals', description: 'Keyboards, mice, webcams, headsets, microphones, and USB devices' },
      { name: 'Storage & Memory', description: 'NVMe SSDs, SATA drives, RAM modules, external drives, and flash storage' },
      { name: 'Displays & Monitors', description: '4K monitors, ultra-wide screens, monitor arms, and display cables' },
      { name: 'Networking Gear', description: 'Routers, switches, access points, Cat6/Cat7 cabling, and patch panels' },
      { name: 'Office & Power', description: 'Smart power strips, UPS backups, label printers, and ergonomic accessories' }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✓ Seeded ${createdCategories.length} Categories`);

    // 4. Seed Suppliers
    const suppliersData = [
      { name: 'Global Tech Logistics', email: 'contact@globaltech.com', phone: '+1-555-0101', address: '100 Silicon Blvd, San Jose, CA 95134' },
      { name: 'Apex Electronics Dist.', email: 'sales@apexelectronics.com', phone: '+1-555-0102', address: '450 Innovation Way, Austin, TX 78701' },
      { name: 'Silicon Hub Inc', email: 'orders@siliconhub.com', phone: '+1-555-0103', address: '788 Chipset Drive, Seattle, WA 98101' },
      { name: 'NextGen Peripherals', email: 'support@nextgenperi.com', phone: '+1-555-0104', address: '220 Peripheral Lane, Portland, OR 97201' },
      { name: 'NetPro Networking Systems', email: 'biz@netprosolutions.com', phone: '+1-555-0105', address: '910 Fiber Optic Blvd, Chicago, IL 60601' },
      { name: 'Quantum Storage Solutions', email: 'sales@quantumstorage.com', phone: '+1-555-0106', address: '330 Solid State Way, Boston, MA 02108' },
      { name: 'Office Depot Direct', email: 'b2b@officedirect.com', phone: '+1-555-0107', address: '500 Enterprise Way, Atlanta, GA 30301' },
      { name: 'Circuit Logistics Corp', email: 'supply@circuitcorp.com', phone: '+1-555-0108', address: '124 Industrial Pkwy, Denver, CO 80201' },
      { name: 'Prime Component Supply', email: 'info@primecomponents.com', phone: '+1-555-0109', address: '670 Microchip St, Phoenix, AZ 85001' },
      { name: 'Alpha Digital Systems', email: 'deals@alphadigital.com', phone: '+1-555-0110', address: '800 Semiconductor Dr, Dallas, TX 75201' }
    ];

    const createdSuppliers = await Supplier.insertMany(suppliersData);
    console.log(`✓ Seeded ${createdSuppliers.length} Suppliers`);

    // Category index lookup (0-indexed)
    // 0: Computers & Laptops
    // 1: Computer Peripherals
    // 2: Storage & Memory
    // 3: Displays & Monitors
    // 4: Networking Gear
    // 5: Office & Power

    // 5. Seed Products with realistic Indian Rupee prices
    const productsData = [
      { sku: 'COMP-LAP-001', name: 'Dell Latitude 15 Pro', description: '15.6-inch Core i7 16GB RAM 512GB SSD Enterprise Laptop', category_id: createdCategories[0]._id, supplier_id: createdSuppliers[0]._id, price: 119999.00, quantity: 25, minimum_stock: 5 },
      { sku: 'COMP-LAP-002', name: 'MacBook Pro 14 M3', description: 'Apple M3 Pro chip, 18GB Unified Memory, 512GB SSD', category_id: createdCategories[0]._id, supplier_id: createdSuppliers[0]._id, price: 189900.00, quantity: 12, minimum_stock: 4 },
      { sku: 'COMP-DSK-003', name: 'ThinkCentre M70 Workstation', description: 'Intel Core i5 Desktop PC 16GB RAM 512GB SSD Small Form Factor', category_id: createdCategories[0]._id, supplier_id: createdSuppliers[1]._id, price: 84950.00, quantity: 18, minimum_stock: 5 },
      { sku: 'PERI-KEY-004', name: 'Logitech MX Mechanical Keyboard', description: 'Wireless tactile mechanical keyboard with backlight', category_id: createdCategories[1]._id, supplier_id: createdSuppliers[3]._id, price: 14999.00, quantity: 45, minimum_stock: 10 },
      { sku: 'PERI-MOU-005', name: 'Logitech MX Master 3S Mouse', description: 'Ergonomic performance wireless mouse with hyper-fast scroll', category_id: createdCategories[1]._id, supplier_id: createdSuppliers[3]._id, price: 9999.00, quantity: 38, minimum_stock: 10 },
      { sku: 'PERI-CAM-006', name: 'Logitech Brio 4K Webcam', description: 'Ultra HD 4K webcam with HDR and auto light correction', category_id: createdCategories[1]._id, supplier_id: createdSuppliers[3]._id, price: 17999.00, quantity: 4, minimum_stock: 10 }, // LOW STOCK
      { sku: 'PERI-AUD-007', name: 'Sony WH-1000XM5 Headset', description: 'Industry-leading noise cancelling wireless Bluetooth headset', category_id: createdCategories[1]._id, supplier_id: createdSuppliers[3]._id, price: 29990.00, quantity: 14, minimum_stock: 5 },
      { sku: 'STOR-SSD-008', name: 'Samsung 990 PRO 2TB NVMe SSD', description: 'PCIe 4.0 M.2 2280 internal gaming & workstation solid state drive', category_id: createdCategories[2]._id, supplier_id: createdSuppliers[5]._id, price: 17999.00, quantity: 30, minimum_stock: 8 },
      { sku: 'STOR-SSD-009', name: 'Crucial P3 Plus 1TB PCIe M.2', description: 'High-speed Gen4 NVMe 3D NAND internal SSD', category_id: createdCategories[2]._id, supplier_id: createdSuppliers[5]._id, price: 6499.00, quantity: 50, minimum_stock: 15 },
      { sku: 'STOR-RAM-010', name: 'Corsair Vengeance 32GB DDR5 RAM', description: 'DDR5 6000MHz CL30 dual channel desktop memory kit', category_id: createdCategories[2]._id, supplier_id: createdSuppliers[2]._id, price: 10999.00, quantity: 22, minimum_stock: 6 },
      { sku: 'STOR-EXT-011', name: 'SanDisk 2TB Extreme Portable SSD', description: 'Rugged external USB-C drive with up to 1050MB/s speed', category_id: createdCategories[2]._id, supplier_id: createdSuppliers[5]._id, price: 14950.00, quantity: 16, minimum_stock: 5 },
      { sku: 'DISP-MON-012', name: 'Dell UltraSharp 27" 4K Monitor', description: 'IPS Black technology, USB-C hub, 100% sRGB color accuracy', category_id: createdCategories[3]._id, supplier_id: createdSuppliers[1]._id, price: 54990.00, quantity: 8, minimum_stock: 5 },
      { sku: 'DISP-MON-013', name: 'LG 34" UltraWide Curved Display', description: 'WQHD IPS monitor with HDR10 and 100Hz refresh rate', category_id: createdCategories[3]._id, supplier_id: createdSuppliers[1]._id, price: 44999.00, quantity: 3, minimum_stock: 5 }, // LOW STOCK
      { sku: 'DISP-ARM-014', name: 'Ergotron LX Dual Monitor Arm', description: 'Heavy-duty adjustable aluminum dual desk mount arm', category_id: createdCategories[3]._id, supplier_id: createdSuppliers[6]._id, price: 24900.00, quantity: 9, minimum_stock: 3 },
      { sku: 'NETW-RTR-015', name: 'Cisco Business 150AX WiFi 6 AP', description: 'Dual-band enterprise ceiling mount access point', category_id: createdCategories[4]._id, supplier_id: createdSuppliers[4]._id, price: 12500.00, quantity: 11, minimum_stock: 4 },
      { sku: 'NETW-SWT-016', name: 'TP-Link 24-Port Gigabit Switch', description: 'Managed L2 switch with 24 PoE+ ports and 4 SFP slots', category_id: createdCategories[4]._id, supplier_id: createdSuppliers[4]._id, price: 26999.00, quantity: 6, minimum_stock: 3 },
      { sku: 'NETW-CBL-017', name: 'Cat6 Snagless Ethernet Cable 50ft', description: 'High performance RJ45 patch cable (Pack of 5)', category_id: createdCategories[4]._id, supplier_id: createdSuppliers[4]._id, price: 1299.00, quantity: 2, minimum_stock: 15 }, // LOW STOCK
      { sku: 'OFFC-UPS-018', name: 'APC Smart-UPS 1500VA Battery', description: 'Pure sine wave uninterruptible power supply for servers', category_id: createdCategories[5]._id, supplier_id: createdSuppliers[7]._id, price: 42900.00, quantity: 5, minimum_stock: 2 },
      { sku: 'OFFC-PRN-019', name: 'Brother Laser All-in-One Printer', description: 'Duplex wireless monochrome laser printer, scanner, copier', category_id: createdCategories[5]._id, supplier_id: createdSuppliers[6]._id, price: 24999.00, quantity: 2, minimum_stock: 5 }, // LOW STOCK
      { sku: 'OFFC-PWR-020', name: 'Anker 100W GaN Charging Station', description: '6-in-1 desktop USB-C charging dock with AC outlets', category_id: createdCategories[5]._id, supplier_id: createdSuppliers[9]._id, price: 6999.00, quantity: 35, minimum_stock: 10 }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✓ Seeded ${createdProducts.length} Products (including 4 marked as low stock for testing)`);

    // Product lookup by SKU
    const productMap = {};
    createdProducts.forEach(p => {
      productMap[p.sku] = p._id;
    });

    // 6. Seed Transactions
    const transactionsData = [
      { product_id: productMap['COMP-LAP-001'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 25, previous_quantity: 0, new_quantity: 25, reason: 'Initial purchase order shipment received' },
      { product_id: productMap['COMP-LAP-002'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 15, previous_quantity: 0, new_quantity: 15, reason: 'MacBook bulk intake for new engineering batch' },
      { product_id: productMap['COMP-LAP-002'], user_id: userMap['manager1@inventory.com'], type: 'OUT', quantity: 3, previous_quantity: 15, new_quantity: 12, reason: 'Dispatched to Senior Tech Leads onboarding' },
      { product_id: productMap['PERI-KEY-004'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 50, previous_quantity: 0, new_quantity: 50, reason: 'Q3 Peripherals replenishment' },
      { product_id: productMap['PERI-KEY-004'], user_id: userMap['employee1@inventory.com'], type: 'OUT', quantity: 5, previous_quantity: 50, new_quantity: 45, reason: 'Allocated to marketing workstations' },
      { product_id: productMap['PERI-MOU-005'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 40, previous_quantity: 0, new_quantity: 40, reason: 'Mouse bulk supply from NextGen' },
      { product_id: productMap['PERI-MOU-005'], user_id: userMap['employee2@inventory.com'], type: 'OUT', quantity: 2, previous_quantity: 40, new_quantity: 38, reason: 'Issued to remote QA testers' },
      { product_id: productMap['PERI-CAM-006'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 10, previous_quantity: 0, new_quantity: 10, reason: 'Webcam stock arrival' },
      { product_id: productMap['PERI-CAM-006'], user_id: userMap['employee1@inventory.com'], type: 'OUT', quantity: 6, previous_quantity: 10, new_quantity: 4, reason: 'Issued for boardroom setup' },
      { product_id: productMap['STOR-SSD-008'], user_id: userMap['manager1@inventory.com'], type: 'IN', quantity: 30, previous_quantity: 0, new_quantity: 30, reason: 'Samsung 990 PRO drive delivery' },
      { product_id: productMap['DISP-MON-013'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 5, previous_quantity: 0, new_quantity: 5, reason: 'LG UltraWide monitors arrival' },
      { product_id: productMap['DISP-MON-013'], user_id: userMap['manager2@inventory.com'], type: 'OUT', quantity: 2, previous_quantity: 5, new_quantity: 3, reason: 'Design team setup fulfillment' },
      { product_id: productMap['NETW-CBL-017'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 20, previous_quantity: 0, new_quantity: 20, reason: 'Cat6 cables stock from NetPro' },
      { product_id: productMap['NETW-CBL-017'], user_id: userMap['employee1@inventory.com'], type: 'OUT', quantity: 18, previous_quantity: 20, new_quantity: 2, reason: 'Server rack re-cabling project' },
      { product_id: productMap['OFFC-PRN-019'], user_id: userMap['admin@inventory.com'], type: 'IN', quantity: 5, previous_quantity: 0, new_quantity: 5, reason: 'Brother printers delivered' },
      { product_id: productMap['OFFC-PRN-019'], user_id: userMap['employee2@inventory.com'], type: 'OUT', quantity: 3, previous_quantity: 5, new_quantity: 2, reason: 'Floor 3 & 4 executive printing stations' },
      { product_id: productMap['OFFC-PWR-020'], user_id: userMap['manager1@inventory.com'], type: 'IN', quantity: 35, previous_quantity: 0, new_quantity: 35, reason: 'Anker charging docks inventory stock in' }
    ];

    const createdTransactions = await Transaction.insertMany(transactionsData);
    console.log(`✓ Seeded ${createdTransactions.length} Inventory Transactions`);

    console.log('========================================================');
    console.log('Demo Credentials:');
    console.log('  ADMIN:    admin@inventory.com    / Admin@123');
    console.log('  MANAGER:  manager1@inventory.com / Manager@123');
    console.log('  MANAGER:  manager2@inventory.com / Manager@123');
    console.log('  EMPLOYEE: employee1@inventory.com/ Employee@123');
    console.log('  EMPLOYEE: employee2@inventory.com/ Employee@123');
    console.log('  EMPLOYEE: employee3@inventory.com/ Employee@123');
    console.log('========================================================');

  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('✓ Database seeding completed successfully.');
    process.exit(0);
  });
}

module.exports = seedDatabase;
