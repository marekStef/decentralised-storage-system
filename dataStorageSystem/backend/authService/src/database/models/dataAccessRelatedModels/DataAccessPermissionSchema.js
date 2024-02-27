const mongoose = require('mongoose');
const EventPermissionSchema = require('./EventPermissionSchema')

const DataAccessPermissionSchema = new mongoose.Schema({
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  permission: EventPermissionSchema,
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  approvedDate: {
    type: Date,
    default: null
  },
  isActive: { // whether the token is still good to use ( can be revoked from the admin user interface )
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

const TokenSchema = mongoose.model('Token', DataAccessPermissionSchema);

module.exports = TokenSchema;
