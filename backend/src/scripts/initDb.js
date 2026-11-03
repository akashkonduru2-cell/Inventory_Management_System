const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const seedDatabase = require('./seedDb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

async function initDatabase() {
  console.log('--- Initializing MongoDB Database ---');
  console.log(`Connecting to: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to MongoDB server.');

    // Ensure model indexes are created
    await Promise.all([
      User.init(),
      Category.init(),
      Supplier.init(),
      Product.init(),
      Transaction.init()
    ]);
    console.log('✓ MongoDB indexes initialized.');

    // Check if database has users; if empty, run seeder
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('ℹ️ Database is empty. Seeding initial demo data...');
      await seedDatabase();
    } else {
      console.log(`✓ Existing database verified (${userCount} users found).`);
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  initDatabase().then(() => {
    console.log('✓ Database initialization completed.');
    process.exit(0);
  });
}

module.exports = initDatabase;
