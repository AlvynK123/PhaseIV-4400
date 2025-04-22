const express = require('express');
const cors = require('cors');
const storedProceduresRoutes = require('./routes/storedProceduresRoutes');
const dbViewRoutes = require('./routes/dbViewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Airline Management System API is running!' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test endpoint is working!' });
});

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ 
      message: 'Database connection successful!',
      testResult: rows[0].result,
      connectionInfo: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      message: 'Database connection failed!',
      error: error.message
    });
  }
});

// Routes
app.use('/api/stored-procedures', storedProceduresRoutes);
app.use('/api/db', dbViewRoutes);
app.use('/api/views', viewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 