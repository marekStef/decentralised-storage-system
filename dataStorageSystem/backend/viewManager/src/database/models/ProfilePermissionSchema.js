const mongoose = require('mongoose');

const ProfilePermissionSchema = new mongoose.Schema({
  profile: {
    type: String,
    required: true
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

module.exports = ProfilePermissionSchema;