// ✅ routes/dashboard.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// Load mock data only once
const mockDataPath = path.join(__dirname, '../data/mockVehicleData.json');
const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

// GET /api/dashboard
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.assignedVehicleIndex == null) {
      return res.status(404).json({ error: 'User or assigned vehicle not found' });
    }
    const vehicle = mockData[user.assignedVehicleIndex];
    res.json(vehicle);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
