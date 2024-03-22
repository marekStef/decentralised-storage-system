const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  nameDefinedByUser: { // this is just for displaying purposes
    type: String,
    required: true,
    unique: true
  },
  nameDefinedByApp: { // this is the main name which will be referenced in profiles and events
    type: String,
    trim: true,
    index: true,
    sparse: true // so that there can be multiple itemss with nameDefinedByApp set to null
  },
  dateOfRegistration: { // date when the user created this new app. This is not date when the actual app associated itself with this
    type: Date,
    default: Date.now
  },
  dateOfAssociationByApp: { // date when the user actually connected the actual app with this
    type: Date,
    default: null
  },
  jwtTokenForPermissionRequestsAndProfiles: {
    type: String,
    default: null
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;