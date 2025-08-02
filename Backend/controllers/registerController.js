// ✅ registerController.js - Clean & Working
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    console.log("🟢 registerUser() called");
    console.log("📦 Incoming data:", req.body);

    const {
      firstName, lastName, email, phone, dateOfBirth, password,
      securityQuestion, securityAnswer,
      vehicleMake, vehicleModel, vehicleYear, vehicleType,
      fuelType, currentMileage, vehicleColor
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword,
      securityQuestion,
      securityAnswer,
      vehicle: {
        make: vehicleMake,
        model: vehicleModel,
        year: vehicleYear,
        type: vehicleType,
        fuelType,
        currentMileage: parseInt(currentMileage, 10),
        color: vehicleColor
      }
    });

    console.log("📤 Saving user to DB...");
    await newUser.save();
    console.log("✅ User saved.");

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ message: 'User registered successfully', token });

  } catch (err) {
    console.error("❌ registerUser error:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerUser };
