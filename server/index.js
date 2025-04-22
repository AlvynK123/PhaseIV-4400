const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Replace with your actual password
  database: process.env.DB_NAME || 'flight_tracking'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Import routes
const viewRoutes = require('./routes/viewRoutes');
const dbViewRoutes = require('./routes/dbViewRoutes');

// Use routes
app.use('/api/views', viewRoutes);
app.use('/api/db', dbViewRoutes);

// Routes for Airlines
app.get('/api/airlines', (req, res) => {
  db.query('SELECT * FROM airline', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Routes for Airplanes
app.get('/api/airplanes', (req, res) => {
  db.query('SELECT * FROM airplane', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Routes for Passengers
app.get('/api/passengers', (req, res) => {
  db.query(`
    SELECT p.*, ps.miles, ps.funds 
    FROM person p
    JOIN passenger ps ON p.personID = ps.personID
  `, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});


// Routes for Flights
app.get('/api/flights', (req, res) => {
  db.query(`
    SELECT f.*, r.routeID, a.airlineID, a.tail_num
    FROM flight f
    JOIN route r ON f.routeID = r.routeID
    LEFT JOIN airplane a ON f.support_airline = a.airlineID AND f.support_tail = a.tail_num
  `, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Routes for Locations
app.get('/api/locations', (req, res) => {
  db.query('SELECT * FROM location', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 