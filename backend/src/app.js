const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Middleware imports
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: true, // Allow all origins for dev/interview demo
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Inventory Management System Backend API is active',
    health: '/api/health',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Inventory Management API is healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
