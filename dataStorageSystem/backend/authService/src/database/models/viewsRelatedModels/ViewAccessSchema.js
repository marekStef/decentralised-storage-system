const mongoose = require('mongoose');

const ViewAccessSchema = new mongoose.Schema({
  app: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  viewAccessName: {
    type: String,
    required: true,
  },
  viewInstanceId: {
    type: String
  },
  viewAccessToken: {
    type: String
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  },
});

const ViewAccess = mongoose.model('ViewAccess', ViewAccessSchema);

module.exports = ViewAccess;
