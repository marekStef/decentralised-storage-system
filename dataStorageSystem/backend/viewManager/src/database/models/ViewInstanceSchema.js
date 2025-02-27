const mongoose = require('mongoose');

const ViewInstanceSchema = new mongoose.Schema({
    viewTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ViewTemplate',
        required: true
    },
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
    },
	configuration: {
		type: Object,
		required: true,
        default: {}
	}
});

const ViewInstance = mongoose.model('ViewInstance', ViewInstanceSchema);

module.exports = ViewInstance;