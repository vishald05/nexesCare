const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String, required: true },
  type: { type: String, required: true },
  fuelType: { type: String, required: true },
  currentMileage: { type: Number, required: true },
  color: { type: String, required: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  vehicle: vehicleSchema,
  // Add assigned vehicle data index
  assignedVehicleIndex: { type: Number, required: true, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
