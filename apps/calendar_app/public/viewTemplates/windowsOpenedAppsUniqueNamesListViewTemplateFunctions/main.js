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

function getUniqueExeNames(dataEndpoint, tokenForWindowsActivityTrackerEvents) {
    return new Promise((res, rej) => {
        getAllWindowsActivityTrackerEvents(dataEndpoint, tokenForWindowsActivityTrackerEvents)
        .then(response => {
            const uniqueExeNames = new Set();

            response.events.forEach(event => {
                const exeName = event.payload?.exeName;
        
                if (exeName) {
                    uniqueExeNames.add(exeName);
                }
            });

            res({
                code: 200,
                uniqueExeNames: Array.from(uniqueExeNames),
                response,
                tokenForWindowsActivityTrackerEvents,
            })
        })
        .catch(err => {
            console.log(err);
            res({
                code: 500,
                message: 'Something went wrong when requesting events'
            })
        });
    })
}

function isDateWithinInterval(dateToCheckStr, startDateStr, endDateStr) {
    const checkDate = new Date(dateToCheckStr).getTime();
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();

    return checkDate >= start && checkDate <= end;
}

// function getWindowsAppsEventsForSpecificInterval(dataEndpoint, tokenForWindowsActivityTrackerEvents, clientCustomData) {
//     const intervalStartTime = clientCustomData.selectedWeek.startOfWeek;
//     const intervalEndTime = clientCustomData.selectedWeek.endOfWeek;

//     return new Promise((res, rej) => {
//         getAllWindowsActivityTrackerEvents(dataEndpoint, tokenForWindowsActivityTrackerEvents)
//             .then(response => {
//                 const filteredWindowsApps = response.events.filter(event => isDateWithinInterval(event.metadata.createdDate, intervalStartTime, intervalEndTime));

//                 res({
//                     code: 200,
//                     filteredWindowsApps,
//                     response,
//                 })
//             })
//             .catch(err => {
//                 console.log(err);
//                 res({
//                     code: 500,
//                     message: 'Something went wrong when requesting events'
//                 })
//             });
//     })
// }

// function getWindowsAppsEventsForSpecificInterval(dataEndpoint, tokenForWindowsActivityTrackerEvents, clientCustomData) {
//     const intervalStartTime = new Date(clientCustomData.selectedWeek.startOfWeek);
//     const intervalEndTime = new Date(clientCustomData.selectedWeek.endOfWeek);

//     const days = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => []));

//     return new Promise((res, rej) => {
//         getAllWindowsActivityTrackerEvents(dataEndpoint, tokenForWindowsActivityTrackerEvents)
//             .then(response => {
//                 response.events.forEach(event => {
//                     const eventDate = new Date(event.metadata.createdDate);
//                     if (eventDate >= intervalStartTime && eventDate <= intervalEndTime) {
//                         const dayOffset = Math.floor((eventDate - intervalStartTime) / (1000 * 60 * 60 * 24));
//                         const hour = eventDate.getHours();
//                         if (days[dayOffset] !== undefined && days[dayOffset][hour] !== undefined) {
//                             days[dayOffset][hour].push(event);
//                         }
//                     }
//                 });

//                 res({
//                     code: 200,
//                     eventsByDayAndHour: days,
//                     response,
//                     clientCustomData: JSON.stringify(clientCustomData.appsWithAssignedCategories)
//                 });
//             })
//             .catch(err => {
//                 console.log(err);
//                 res({
//                     code: 500,
//                     message: 'Something went wrong when requesting events'
//                 });
//             });
//     });
// }

function getWindowsAppsEventsForSpecificInterval(dataEndpoint, tokenForWindowsActivityTrackerEvents, clientCustomData) {
    const intervalStartTime = new Date(clientCustomData.selectedWeek.startOfWeek);
    const intervalEndTime = new Date(clientCustomData.selectedWeek.endOfWeek);
    const appsWithAssignedCategories = clientCustomData.appsWithAssignedCategories;

    const days = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({})));

    return new Promise((res, rej) => {
        getAllWindowsActivityTrackerEvents(dataEndpoint, tokenForWindowsActivityTrackerEvents)
            .then(response => {
                response.events.forEach(event => {
                    const eventDate = new Date(event.metadata.createdDate);
                    if (eventDate >= intervalStartTime && eventDate <= intervalEndTime) {
                        const dayOffset = Math.floor((eventDate - intervalStartTime) / (1000 * 60 * 60 * 24));
                        const hour = eventDate.getHours();
                        const category = appsWithAssignedCategories[event.payload.exeName] || 'other';

                        if (!days[dayOffset][hour][category]) {
                            days[dayOffset][hour][category] = 0;
                        }
                        days[dayOffset][hour][category]++;
                    }
                });

                const daysWithPercentages = days.map(day =>
                    day.map(hour => {
                        const totalEvents = Object.values(hour).reduce((acc, count) => acc + count, 0);
                        return Object.keys(hour).reduce((acc, category) => {
                            acc[category] = (hour[category] / totalEvents);
                            return acc;
                        }, {});
                    })
                );

                res({
                    code: 200,
                    eventsByDayAndHour: daysWithPercentages,
                    response,
                    appsWithAssignedCategories
                });
            })
            .catch(err => {
                console.log(err);
                res({
                    code: 500,
                    message: 'Something went wrong when requesting events'
                });
            });
    });
}

const mainFunction = (parametersObject) => {
    return new Promise(async (res, rej) => {
        const { accessTokensToProfiles, configuration, clientCustomData, dataEndpoint } = parametersObject;

        const tokenForWindowsActivityTrackerEvents = accessTokensToProfiles["activityTracker.com/activityTrackerEvent"];

        const isAccessTokenActivated = await isAccessTokenActive(dataEndpoint, tokenForWindowsActivityTrackerEvents);

        if (!isAccessTokenActivated) {
            return res({
                code: 400,
                message: 'Access Token is not active! - Windows Opened Apps View (you need to approve permission for this View Instance inside Control Centre)'
            })
        }

        if (clientCustomData.getUniqueApps == true) {
            return getUniqueExeNames(dataEndpoint, tokenForWindowsActivityTrackerEvents)
                .then(responseData => {
                    res(responseData);
                })
                .catch(errData => {
                    res(errData);
                })
        }

        if (clientCustomData.getAppsForSpecificDay == true) {
            return getWindowsAppsEventsForSpecificInterval(dataEndpoint, tokenForWindowsActivityTrackerEvents, clientCustomData)
                .then(responseData => {
                    res(responseData);
                })
                .catch(errData => {
                    res(errData);
                })
        }

        res({ code: 400 });
    })
}

module.exports = mainFunction;