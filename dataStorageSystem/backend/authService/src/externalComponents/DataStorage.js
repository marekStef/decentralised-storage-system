const axios = require('axios');

const httpStatusCodes = require('../constants/forApiResponses/httpStatusCodes');

const DATA_STORAGE_ENDPOINT_FOR_UPLOADING_NEW_EVENTS = 'app/api/uploadNewEvents';
const DATA_STORAGE_ENDPOINT_FOR_GETTING_FILTERED_EVENTS = 'app/api/getFilteredEvents';

class DataStorage {
    /**
     * This function sends events to the data storage.
     * 
     * @param {Array<Object>} events - The events to be sent to the data storage component.
     * @returns A promise that resolves with the response code and message.
     */
    sendEventsToDataStorage(events) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(`${process.env.DATA_STORAGE_URL}/${DATA_STORAGE_ENDPOINT_FOR_UPLOADING_NEW_EVENTS}`, {
                    events: events
                });

                if (response.status === httpStatusCodes.CREATED) {
                    console.log('Event uploaded successfully:', response.data.message);
                    resolve({ code: httpStatusCodes.CREATED, message: response.data.message });
                } else {
                    // Other status codes except for 500
                    console.error('Unexpected response status:', response.status);
                    reject({ code: response.status, message: 'Unexpected response status: ' + response.status });
                }
            } catch (error) {
                if (error.response && error.response.status === httpStatusCodes.INTERNAL_SERVER_ERROR) {
                    console.log(error.response.data.message);
                    reject({ code: httpStatusCodes.INTERNAL_SERVER_ERROR, message: error.response.data.message });
                } else {
                    // network issue
                    console.log("Network or other error", error.message || error);
                    reject({ code: error.response ? error.response.status : 'Network error', message: error.message || "Network or other error" });
                }
            }
        });
    }

    /**
     * Get a profile from the data storage by profile name.
     * 
     * @param {string} profile_name - The name of the profile to retrieve from data storage component.
     * @returns A promise that resolves with the response code and body containing the actual profile.
     */
    getProfileFromDataStorage(profile_name) {
        return new Promise(async (resolve, reject) => {
            try {
                // this should be get but adding body in get request is not supported
                const response = await axios.post(`${process.env.DATA_STORAGE_URL}/${DATA_STORAGE_ENDPOINT_FOR_GETTING_FILTERED_EVENTS}`, {
                    payloadMustContain: {
                        profile_name
                    }
                });

                if (response.status === httpStatusCodes.OK) {
                    // console.log('getProfileFromDataStorage:', response.data);
                    resolve({ code: httpStatusCodes.OK, body: response.data });
                } else {
                    // Other status codes except for 500
                    console.error('Unexpected response status:', response.status);
                    reject({ code: response.status, message: 'Unexpected response status: ' + response.status });
                }
            } catch (error) {
                if (error.response && error.response.status === httpStatusCodes.INTERNAL_SERVER_ERROR) {
                    console.log(error.response.data.message);
                    reject({ code: httpStatusCodes.INTERNAL_SERVER_ERROR, message: error.response.data.message });
                } else {
                    // network issue
                    console.log("Network or other error", error.message || error);
                    reject({ code: error.response ? error.response.status : 'Network error', message: error.message || "Network or other error" });
                }
            }
        })
    }
}

const instance = new DataStorage();

module.exports = instance;
