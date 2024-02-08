const mongoose = require('mongoose');

const EventPermissionSchema = new mongoose.Schema({
  appName: { // name of the app which produces these events
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  grantedDate: {
    type: Date,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  create: {
    type: Boolean,
    default: false
  },
  modify: {
    type: Boolean,
    default: false
  },
  delete: {
    type: Boolean,
    default: false
  }
});

module.exports = EventPermissionSchema;