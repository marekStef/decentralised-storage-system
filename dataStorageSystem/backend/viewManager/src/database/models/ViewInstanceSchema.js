const mongoose = require('mongoose');

const ViewInstanceSchema = new mongoose.Schema({
    viewTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ViewTemplate',
        required: true
    },
    // identifier: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    createdDate: {
        type: Date,
        default: Date.now
    },
    // source: {
    //     type: String,
    //     required: true
    // },
    accessTokensToProfiles: { // tokens to profiles defined in ViewTemplate ( keys must be the profile names defined in "profiles" in ViewTemplateSchema)
        type: Object
    }
});

const ViewInstance = mongoose.model('ViewInstance', ViewInstanceSchema);

module.exports = ViewInstance;