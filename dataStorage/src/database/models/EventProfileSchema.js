const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  schema: {
    type: Object,
    required: true
  }
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
