const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/registerController');

// POST /api/register
router.post('/', registerUser);

const User = require('../models/User');

// Temporary route to check data
router.get('/all', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users); // or use res.send(users)
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

module.exports = router;

