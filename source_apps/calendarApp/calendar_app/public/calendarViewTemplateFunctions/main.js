const { getResponseMessage } = require('./helpers');

const helloWorld = async (parametersObject) => {
    const { accessTokensToProfiles, configuration, clientCustomData, authServiceEndpoint } = parametersObject;

    const tokenForCalendarEvents = accessTokensToProfiles["CalendarPro.com_CalendarEventProfile"];

    return new Promise((res, rej) => {
        fetch(`${authServiceEndpoint}/app/api/checkAccessTokenStatus?accessToken=${tokenForCalendarEvents}`)
            .then(response => response.json())
            .then(response => {
                console.log(response);
                setTimeout(() => {
                    res({
                        message: 'this is object from view',
                        helloMessage: getResponseMessage(),
                        accessTokensToProfiles,
                        configuration,
                        clientCustomData,
                        isAccessTokenForCalendarEventsActive: response
                    });
                }, 1000);
            })
            .catch(err => {
                res({
                    message: 'could not load fake json data from net',
                    err: JSON.stringify(err)
                })
            })
    })
}

module.exports = helloWorld;