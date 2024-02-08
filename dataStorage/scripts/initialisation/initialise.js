require('dotenv').config();
const mongoose = require('mongoose');
const ProfileSchema = require('../../src/database/models/eventRelatedModels/EventProfileSchema');

const appCoreProfileSchema_v1 = require('./data/app_core_profile_schema_v1.json');

mongoose.connect(process.env.MONGO_DB_URI, {})
    .then(() => console.log('MongoDB successfully connected'))
    .catch(err => console.error('Could not connect to database (mongodb):', err));

// Define the JSON schema for the profile
const create_app_core_profile_for_definining_other_profiles = () => {
    // Create the profile
    const profileData = {
        name: "app:core_v1",
        metadata: {
            createdDate: new Date(),
            sourceAppName: process.env.DATA_STORAGE_DOMAIN,
            acceptedDate: new Date()
        },
        schema: JSON.stringify(appCoreProfileSchema_v1)
    };

    ProfileSchema.create(profileData)
        .then(() => {
            console.log('Profile "app:core" has been created with the JSON schema.');
            mongoose.disconnect();
        })
        .catch(err => {
            console.error('Error creating the profile:', err);
            mongoose.disconnect();
        });
}

// ****** MAIN ********

create_app_core_profile_for_definining_other_profiles();

