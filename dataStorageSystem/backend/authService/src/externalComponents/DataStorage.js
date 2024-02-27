const axios = require('axios');

class DataStorage {
    sendEventsToDataStorage(events) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(`${process.env.DATA_STORAGE_URL}/app/api/upload_new_events`, {
                    events: events
                });

                if (response.status === 201) {
                    console.log('Event uploaded successfully:', response.data.message);
                    resolve({ code: 201, message: response.data.message });
                } else {
                    // Other status codes except for 500
                    console.error('Unexpected response status:', response.status);
                    reject({ code: response.status, message: 'Unexpected response status: ' + response.status });
                }
            } catch (error) {
                if (error.response && error.response.status === 500) {
                    console.log(error.response.data.message);
                    reject({ code: 500, message: error.response.data.message });
                } else {
                    // network issue
                    console.log("Network or other error", error.message || error);
                    reject({ code: error.response ? error.response.status : 'Network error', message: error.message || "Network or other error" });
                }
            }
        });
    }

    getProfileFromDataStorage(profile_name) {
        return new Promise(async (resolve, reject) => {
            try {
                // this should be get but adding body in get request is not supported
                const response = await axios.post(`${process.env.DATA_STORAGE_URL}/app/api/get_filtered_events`, {
                    payloadMustContain: {
                        profile_name
                    }
                });

                if (response.status === 200) {
                    // console.log('getProfileFromDataStorage:', response.data);
                    resolve({ code: 200, body: response.data });
                } else {
                    // Other status codes except for 500
                    console.error('Unexpected response status:', response.status);
                    reject({ code: response.status, message: 'Unexpected response status: ' + response.status });
                }
            } catch (error) {
                if (error.response && error.response.status === 500) {
                    console.log(error.response.data.message);
                    reject({ code: 500, message: error.response.data.message });
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
