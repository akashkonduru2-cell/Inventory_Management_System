const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 5000;

// 1. Instantly fire database connection check in the cloud
db.testConnection().catch((error) => {
  console.error('Failed to connect to the database:', error);
});

// 2. ONLY start the local server if running locally, NOT on Vercel
if (process.env.VERCEL !== '1') {
  async function startServer() {
    try {
      app.listen(PORT, '0.0.0.0', () => {
        console.log('========================================================');
        console.log(`🚀 Inventory Management Backend running on port ${PORT}`);
        console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
        console.log('========================================================');
      });
    } catch (error) {
      console.error('Failed to start local server:', error);
      process.exit(1);
    }
  }
  startServer();
}

// 3. CRITICAL FOR VERCEL: Export the app module
module.exports = app;
