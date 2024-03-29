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

const getAllWindowsActivityTrackerEvents = (endpoint, tokenForEvents) => {
    return new Promise(async (res, rej) => {
        try {
            const response = await get(`${endpoint}${GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN}`, {
                accessToken: tokenForEvents
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

function getUniqueExeNames(events) {
    const uniqueExeNames = new Set();

    events.forEach(event => {
        const exeName = event.payload?.exeName;

        if (exeName) {
            uniqueExeNames.add(exeName);
        }
    });

    return Array.from(uniqueExeNames);
}

const mainFunction = (parametersObject) => {
    return new Promise(async (res, rej) => {
        const { accessTokensToProfiles, configuration, clientCustomData, dataEndpoint } = parametersObject;

        const tokenForWindowsActivityTrackerEvents = accessTokensToProfiles["activityTracker.com/activityTrackerEvent"];

        const isAccessTokenActivated = await isAccessTokenActive(dataEndpoint, tokenForWindowsActivityTrackerEvents);

        if (!isAccessTokenActivated) {
            return res({
                code: 400,
                message: 'Access Token is not active!'
            })
        }

        getAllWindowsActivityTrackerEvents(dataEndpoint, tokenForWindowsActivityTrackerEvents)
            .then(response => {
                res({
                    code: 200,
                    uniqueExeNames: getUniqueExeNames(response.events),
                    response,
                    tokenForWindowsActivityTrackerEvents
                })
                // res({
                //     code: 200,
                //     uniqueExeNames: getUniqueExeNames(response.events),
                //     response,
                //     tokenForWindowsActivityTrackerEvents
                // })
            })
            .catch(err => {
                res({
                    code: 500,
                    message: 'Something went wrong when requesting events'
                })
            });
    })
}

module.exports = mainFunction;