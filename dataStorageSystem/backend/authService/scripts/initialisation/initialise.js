const axios = require("axios")
const {v4: uuidv4} = require("uuid");
require('dotenv').config();
// const mongoose = require('mongoose');

const appCoreProfileSchema_v1 = require('./data/app_core_profile_schema_v1.json');

const DataStorage = require('../../src/externalComponents/DataStorage')

// mongoose.connect(process.env.MONGO_DB_URI, {})
//     .then(() => console.log('MongoDB successfully connected'))
//     .catch(err => console.error('Could not connect to database (mongodb):', err));

const sendEventsToDataStorage = async (events) => {
    DataStorage.sendEventsToDataStorage(events)
        .then(({code, message}) => {
            if (code === 201) {
                console.log('Event uploaded successfully:', message);
            } else {
                // Other status codes except for 500
                console.error('Unexpected response status:', code);
                throw new Error('Unexpected response status: ' + code);
            }
        })
        .catch((err) => {
            console.log("!!! look at the problem in dataStorage")
            console.log(err)
        })
}

// Define the JSON schema for the profile
const create_app_core_profile_for_definining_other_profiles = async () => {
    try {
        const {code, body} = await DataStorage.getProfileFromDataStorage(process.env.DEFAULT_CORE_PROFILE_SCHEMA_NAME)
        if (body.count != 0) {
            console.log('profiles are already created in the storage');
            return;
        }
    } catch (err) {
        console.log(err);
    }

    // Create the profile
    const profileData = {
        metadata: {
            createdDate: new Date(),
            source: process.env.AUTH_SERVICE_DOMAIN,
            acceptedDate: new Date(),
            profile: "" // this is the root of all profiles
        },
        payload: {
            profile_name: process.env.DEFAULT_CORE_PROFILE_SCHEMA_NAME,
            json_schema: appCoreProfileSchema_v1
        }
    };

    try {
        await sendEventsToDataStorage([profileData])
    } catch (err) {
        console.log(err);
    }

    // ProfileSchema.create(profileData)
    //     .then(() => {
    //         console.log('Profile "app:core" has been created with the JSON schema.');
    //         mongoose.disconnect();
    //     })
    //     .catch(err => {
    //         console.error('Error creating the profile:', err);
    //         mongoose.disconnect();
    //     });
}

create_app_core_profile_for_definining_other_profiles();

