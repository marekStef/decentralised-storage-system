const mongoose = require('mongoose');
const EventPermissionSchema = require('./EventPermissionSchema')

const DataAccessTokenSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  permissions: [EventPermissionSchema],
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  approvedDate: {
    type: Date,
    default: null
  },
  isRevoked: { // whether the token is still good to use ( can be revoked from the admin user interface )
    type: Boolean,
    default: false
  },
  revokedDate: {
    type: Date,
    default: null
  },
  expirationDate: {
    type: Date,
    default: null
  }
});

const TokenSchema = mongoose.model('Token', DataAccessTokenSchema);

module.exports = TokenSchema;
