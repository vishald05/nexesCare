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

// GET /api/dashboard - Main dashboard data
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.assignedVehicleIndex == null) {
      return res.status(404).json({ error: 'User or assigned vehicle not found' });
    }
    
    // Get the assigned vehicle data from mock data
    const vehicleData = mockData[user.assignedVehicleIndex];
    
    // Combine user info with vehicle data
    const dashboardData = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        vehicle: user.vehicle
      },
      vehicleData: vehicleData,
      summary: {
        lastLogin: new Date().toISOString(),
        vehicleStatus: vehicleData.engineStatus,
        nextMaintenance: vehicleData.lastService,
        mileage: vehicleData.mileage,
        batteryHealth: vehicleData.batteryHealth,
        criticalAlerts: vehicleData.criticalAlerts.length,
        upcomingTasks: vehicleData.upcomingTasks.length
      }
    };
    
    console.log(`🚗 Dashboard loaded for ${user.firstName} - Vehicle: ${vehicleData.vehicleId}`);
    res.json(dashboardData);
    
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/vehicle - Detailed vehicle data only
router.get('/vehicle', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.assignedVehicleIndex == null) {
      return res.status(404).json({ error: 'User or assigned vehicle not found' });
    }
    
    const vehicleData = mockData[user.assignedVehicleIndex];
    res.json(vehicleData);
    
  } catch (err) {
    console.error('Vehicle data error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/profile - User profile data
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      vehicle: user.vehicle,
      createdAt: user.createdAt
    });
    
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
