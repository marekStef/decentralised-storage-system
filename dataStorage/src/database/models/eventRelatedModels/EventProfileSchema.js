const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    metadata: {
        createdDate: {
            type: Date,
            required: true
        },
        profile: {
            type: String,
            required: true
        },
        sourceAppName: { // this is nameDefinedByApp field in ApplicationSchema
            type: String,
            required: true
        },
        acceptedDate: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    schema: {
        type: String,
        required: true
    }
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
