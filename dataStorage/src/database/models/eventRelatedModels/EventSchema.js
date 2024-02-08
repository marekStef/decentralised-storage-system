const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  metadata: {
    identifier: {
      type: String,
      required: true,
      unique: true
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
    type: String,
    required: true
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;