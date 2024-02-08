const mongoose = require('mongoose');

const OneTimeAssociationTokenSchema = new mongoose.Schema({
    app: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
}, {collection: 'AssociationTokensForApplication'});

const OneTimeAssociationToken = mongoose.model('AssociationTokenForApplication', OneTimeAssociationTokenSchema);

module.exports = OneTimeAssociationToken;