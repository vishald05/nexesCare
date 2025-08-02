const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/loginController');

// POST /api/login
router.post('/', loginUser);

module.exports = router;
