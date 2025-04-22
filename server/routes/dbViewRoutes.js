const express = require('express');
const router = express.Router();
const db = require('../db');

// View all tables
router.get('/tables', async (req, res) => {
  try {
    const [tables] = await db.query('SHOW TABLES');
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View specific table data
router.get('/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { page, pageSize } = req.query;
    
    // Get total count first
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ${tableName}`);
    const total = countResult[0].total;
    
    // If page and pageSize are provided, use them for pagination
    if (page && pageSize) {
      const offset = (page - 1) * pageSize;
      const limit = parseInt(pageSize);
      const [rows] = await db.query(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`, [limit, offset]);
      
      res.json({
        data: rows,
        pagination: {
          total,
          current: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } else {
      // If no pagination params, return all data (but limit to reasonable amount)
      const [rows] = await db.query(`SELECT * FROM ${tableName} LIMIT 1000`);
      res.json(rows);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 