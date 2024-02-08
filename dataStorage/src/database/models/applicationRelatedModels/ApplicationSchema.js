const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  nameDefinedByUser: {
    type: String,
    required: true,
    unique: true
  },
  nameDefinedByApp: {
    type: String,
    unique: true,
    default: null
  },
  dateOfRegistration: { // date when the user created this new app. This is not date when the actual app associated itself with this
    type: Date,
    default: Date.now
  },
  dateOfAssociationByApp: { // date when the user actually connected the actual app with this
    type: Date,
    default: null
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;