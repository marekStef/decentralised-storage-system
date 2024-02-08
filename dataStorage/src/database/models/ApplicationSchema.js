const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  dateOfRegistration: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;