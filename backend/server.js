const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Smart Placement ERP Server active on port ${PORT}`);
  console.log(`🌐 Web App Interface: http://localhost:${PORT}`);
  console.log(`📊 Health Check:      http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
  
  // Connect to Database asynchronously
  connectDB();
});
