import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env vars
dotenv.config();

// Initialize express app
const app = express();

// Body parser middleware - IMPORTANT: This must come BEFORE route definitions
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Simple auth routes for testing
app.post('/api/auth/student/login', (req, res) => {
  console.log('Student login attempt:', req.body);
  // For testing, accept any roll number
  const { rollNumber } = req.body;
  if (rollNumber) {
    res.json({
      success: true,
      token: 'test-token-student',
      name: 'Test Student',
      rollNumber: rollNumber,
      role: 'student'
    });
  } else {
    res.status(400).json({ success: false, message: 'Roll number is required' });
  }
});

app.post('/api/auth/admin/login', (req, res) => {
  console.log('Admin login attempt:', req.body);
  // For testing, accept admin/admin
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      token: 'test-token-admin',
      name: 'Admin User',
      role: 'admin'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// API test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Serve HTML files - This should come AFTER API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all route to handle any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Connect to database before starting server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});