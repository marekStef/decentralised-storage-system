const { getResponseMessage } = require('./second');

const helloWorld = (accessTokensToProfiles, configuration, clientCustomData) => {
    return {
        message: 'this is object from view',
        helloMessage: getResponseMessage(),
        accessTokensToProfiles,
        configuration,
        clientCustomData
    }
}

module.exports = helloWorld;