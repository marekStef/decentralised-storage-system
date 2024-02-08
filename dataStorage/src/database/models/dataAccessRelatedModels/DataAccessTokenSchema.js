const mongoose = require('mongoose');
const EventPermissionSchema = require('./EventPermissionSchema')

const DataAccessTokenSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  permissions: [EventPermissionSchema]
});

const TokenSchema = mongoose.model('Token', DataAccessTokenSchema);

module.exports = TokenSchema;
