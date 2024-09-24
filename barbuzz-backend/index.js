const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'barbuzz123', // Replace with your MySQL password
  database: 'barbuzz' // Your database name
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoint to register a user
app.post('/signup', (req, res) => {
  const { name, email, dob, password } = req.body;
  const query = 'INSERT INTO users (name, email, dob, password) VALUES (?, ?, ?, ?)';

  db.execute(query, [name, email, dob, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'User registered successfully!' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${3306}`);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  
    db.execute(query, [email, password], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length > 0) {
        res.status(200).json({ message: 'Login successful!', user: results[0] });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  });

  app.get('/bars', (req, res) => {
    const query = 'SELECT * FROM bars';
    
    db.execute(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json(results);
    });
  });
    