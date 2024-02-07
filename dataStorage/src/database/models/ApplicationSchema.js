const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dateOfRegistration: {
    type: Date,
    default: Date.now
  },
  internalIdentifier: {
    type: String,
    required: true,
    unique: true
  },
  tokens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token'
  }]
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;