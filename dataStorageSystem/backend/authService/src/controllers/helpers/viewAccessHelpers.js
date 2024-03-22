const {generateJwtToken, decodeJwtToken} = require('./jwtGenerator');

const generateTokenForViewAccess = (viewInstanceId, appId, authServiceViewAccessId) => {
    return generateJwtToken({
        viewInstanceId,
        appId,
        authServiceViewAccessId
    })
}

const decodeTokenForViewAccess = (token) => {
    return decodeJwtToken(token);
}

module.exports = {
    generateTokenForViewAccess,
    decodeTokenForViewAccess
}