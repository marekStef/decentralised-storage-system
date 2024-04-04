---
sidebar_position: 2
---

# Requirements On Source Code

`View Manager` component is independent of any specific source code language. It depends on other other execution services such as `Javascript Execution Service` or `Python Execution Service`.

Requirements mentioned here are general and valid for all execution services. 

However, it is crucial to recognize that while these general requirements provide a solid framework, each execution service introduces its own set of additional, specific requirements. These nuanced requirements are tailored to the unique characteristics and capabilities of the respective execution service, addressing aspects such as language-specific conventions. It's of high importance for you to read those as well if you are about to develop new block of source code for a new `View Template`.

### Requirements For Javascript Code

To look at the requirements for javascript code, go to `Javascript Execution Service` requirements for source code.

As for the entry point function arguments in case of javascript, it needs to have exactly one.

This argument is an object looking like this:

```js title="JS Entry Point Function Parameter Object Structure"
{ 
    accessTokensToProfiles: {}, // tokens for profiles 
    configuration: {...}, 
    clientCustomData: {...}, // this is the object from the request body
    dataEndpoint: '...' // url for getting data 
}
```

### Examples

This is the `View Template` source code of the `CalendarPro` app:

```js title="main.js"
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
```

```js title="helpers.js"
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

function isDateWithinInterval(dateToCheckStr, startDateStr, endDateStr) {
    const checkDate = new Date(dateToCheckStr).getTime();
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();

    return checkDate >= start && checkDate <= end;
}


module.exports = {
    get,
    isDateWithinInterval
}
```

:::note

As you can see, the names of those javascript source code files are important as they can be imported. Therefore, when you create new `View Template`, you need to be absolutely sure that the names of those files are kept according to originals. Uploading `helpers(1).js` or `helpers - Copy.js` won't work!

:::

Now that you know what requirements on the source code are, you can start creating your own!