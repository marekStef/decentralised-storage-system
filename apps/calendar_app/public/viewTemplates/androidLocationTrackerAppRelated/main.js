const CHECK_ACCESS_TOKEN_STATUS = '/app/api/checkAccessTokenStatus';
const GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN = '/app/api/getAllEventsForGivenAccessToken';

const get = (endpoint, queryParams) => {
    const toQueryString = (params) => {
        return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    };

    const queryString = queryParams ? `?${toQueryString(queryParams)}` : '';
    
    return new Promise((res, rej) => {
        fetch(`${endpoint}${queryString}`)
            .then(response => response.json().then(body => response.ok ? res({...body, status: response.status}) : rej({...body, status: response.status})))
            .catch(error => rej(error));
    });
}

const isAccessTokenActive = (endpoint, accessToken) => {
    return new Promise((res, rej) => {
        get(`${endpoint}${CHECK_ACCESS_TOKEN_STATUS}?accessToken=${accessToken}`)
            .then(response => {
                res(response.isActive);
            })
            .catch(errResponse => {
                rej(false);
            })
    })
}

const getAllLocations = (dataEndpoint, tokenForLocationTrackerEvents, clientCustomData) => {
    return new Promise(async (res, rej) => {
        try {
            const response = await get(`${dataEndpoint}${GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN}`, {
                accessToken: tokenForLocationTrackerEvents
            });

            res({
                ...response,
            });
        } catch (error) {
            console.error('Error getting apps events:', error);
            rej(`Error getting apps events: ${error.message ?? 'Server not reachable probably'}`);
        }
    }) 
}

function filterEventsByDate(events, isoDateString) {
    const inputDate = new Date(isoDateString);
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();
    const day = inputDate.getDate();
  
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.payload.time);
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === day
      );
    });
  
    return filteredEvents;
  }

const mainFunction = (parametersObject) => {
    return new Promise(async (res, rej) => {
        const { accessTokensToProfiles, configuration, clientCustomData, dataEndpoint } = parametersObject;

        const tokenForLocationsData = accessTokensToProfiles["locationTracker.com/profiles/location_profile"];
        
        const isAccessTokenActivated = await isAccessTokenActive(dataEndpoint, tokenForLocationsData);

        if (!isAccessTokenActivated) {
            return res({
                code: 400,
                message: 'Access Token is not active!'
            })
        }

        getAllLocations(dataEndpoint, tokenForLocationsData, clientCustomData)
            .then(response => {
                const locationsEvents = response.events;

                res({ 
                    code: 200,
                    clientCustomData,
                    locations: filterEventsByDate(locationsEvents, clientCustomData.selectedDateInISO),
                    message: 'Locations loaded'
                    // response
                });
            })
            .catch(errResponse => {
                console.log(errResponse);
                res({
                    code: 400,
                    message: 'Could not load locations',
                    errResponse: errResponse
                })
            })
        
    })
}

module.exports = mainFunction;