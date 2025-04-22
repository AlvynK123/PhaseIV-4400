const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
require('dotenv').config();

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Replace with your actual password
  database: process.env.DB_NAME || 'flight_tracking'
});

// Get data from a specific view
router.get('/:viewName', (req, res) => {
  const { viewName } = req.params;
  const query = `SELECT * FROM ${viewName}`;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching view:', err);
      res.status(500).json({ message: err.message });
      return;
    }
    res.json(results);
  });
});

module.exports = router; 