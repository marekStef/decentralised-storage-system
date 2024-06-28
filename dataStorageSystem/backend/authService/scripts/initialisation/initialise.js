const axios = require("axios")
require('dotenv').config();

const appCoreProfileSchema_v1 = require('./data/app_core_profile_schema_v1.json');

const DataStorage = require('../../src/externalComponents/DataStorage')

/**
 * Sends an array of events to the DataStorage.
 * 
 * @async
 * @param {Array} events - The events to be sent to the DataStorage.
 * @returns {Promise<void>} - A promise that resolves when the events are sent.
 * @throws Will throw an error if the response status is not 201 or if there is any other error.
 */
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

/**
 * Creates the core profile for defining other profiles in the DataStorage.
 * 
 * @async
 * @returns A promise that resolves when the core profile is created.
 * @throws Will throw an error if there is any error in fetching or creating the profile.
 */
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
            profile: "" // this is the root of all profiles so it does not have any parent profile
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
}

create_app_core_profile_for_definining_other_profiles();