const { get, isDateWithinInterval } = require('./helpers');

const CHECK_ACCESS_TOKEN_STATUS = '/app/api/checkAccessTokenStatus';
const GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN = '/app/api/getAllEventsForGivenAccessToken';

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

const getAllCalendarEvents = (endpoint, tokenForCalendarEvents) => {
    return new Promise(async (res, rej) => {
        try {
            const response = await get(`${endpoint}${GET_ALL_EVENTS_FOR_GIVEN_ACCESS_TOKEN}`, {
                accessToken: tokenForCalendarEvents
            });

            res({
                ...response,
            });
        } catch (error) {
            console.error('Error getting calendar events:', error);
            rej(`Error getting calendar events: ${error.message ?? 'Server not reachable probably'}`);
        }
    }) 
}

const mainFunction = (parametersObject) => {
    return new Promise(async (res, rej) => {

        const { accessTokensToProfiles, configuration, clientCustomData, dataEndpoint } = parametersObject;

        const tokenForCalendarEvents = accessTokensToProfiles["CalendarPro.com_CalendarEventProfile"];

        const isAccessTokenActivated = await isAccessTokenActive(dataEndpoint, tokenForCalendarEvents);

        // return res({isAccessTokenActivated, tokenForCalendarEvents, dataEndpoint, a: `${dataEndpoint}/app/api/checkAccessTokenStatus?accessToken=${tokenForCalendarEvents}`})

        if (!isAccessTokenActivated) {
            return res({
                code: 400,
                message: 'Access Token is not active!'
            })
        }

        getAllCalendarEvents(dataEndpoint, tokenForCalendarEvents)
            .then(response => {
                const intervalStartTime = clientCustomData.selectedWeek.startOfWeek;
                const intervalEndTime = clientCustomData.selectedWeek.endOfWeek;

                const filteredEvents = response.events.filter(event => isDateWithinInterval(event.payload.startTime, intervalStartTime, intervalEndTime));

                res({
                    code: 200,
                    message: 'Events loaded successfully',
                    response,
                    clientCustomData,
                    filteredEvents
                })
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