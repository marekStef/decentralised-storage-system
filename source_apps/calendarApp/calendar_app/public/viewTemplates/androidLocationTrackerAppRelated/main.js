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

function filterEventsByDate(events, isoDateString) {
    const inputDate = new Date(isoDateString);
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();
    const day = inputDate.getDate();
  
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.time);
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

        const locationsData = [{ latitude: 50.0255, longitude: 14.278, time: '2024-03-30T12:30:00Z' }, { latitude: 52.2755, longitude: 12.43278, time: '2024-03-30T12:30:00Z' }, { latitude: 48.0255, longitude: 8.428, time: '2024-03-30T12:30:00Z' }]

        res({ 
            code: 200,
            clientCustomData,
            locations: filterEventsByDate(locationsData, clientCustomData.selectedDateInISO)
        });
    })
}

module.exports = mainFunction;