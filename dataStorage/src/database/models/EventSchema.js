const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventProfile',
    required: true
  },
  metadata: {
    identifier: {
      type: String,
      required: true
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    profile: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    acceptedDate: {
      type: Date,
      required: true
    }
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;