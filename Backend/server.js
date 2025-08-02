const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
// const connectDB = require('./config/db');

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
connectDB();

app.use(cors());
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));

// Frontend route: register
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/register.html'));
});

// Frontend route: login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/login.html'));
});

// Frontend route: dashboard (for after login)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dashboard.html'));
});

// API routes
app.use('/api/register', require('./routes/register'));
app.use('/api/login', require('./routes/login'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
