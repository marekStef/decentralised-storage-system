const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  metadata: {
    identifier: {
      type: String,
      // unique: true
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    profile: {
        type: String,
        // unique: true,
        // required: true
    },
    source: {
        type: String,
        required: true
    },
    acceptedDate: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  payload: {
    type: Object,
    required: true
  }
});

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;