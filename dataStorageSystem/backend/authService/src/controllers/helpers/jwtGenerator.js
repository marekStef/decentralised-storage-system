require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) using the provided payload and options.
 *
 * This function uses a secret key from the environment variables to sign the JWT.
 * The default expiration time for the token is set to 300 years unless specified otherwise in the options.
 *
 * @param {Object} jwtPayload - The payload to be included in the JWT.
 * @param {Object} [jwtOptions={expiresIn: '300y'}] - Optional settings for the JWT such as expiration time.
 * @param {string} [jwtOptions.expiresIn] - The expiration time for the JWT (for instance '1h', '2d').
 * @returns {string} The generated JWT as a string.
 */
const generateJwtToken = (jwtPayload, jwtOptions = {expiresIn: '300y'}) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtToken = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
    return jwtToken;
}

/**
 * Decodes a JSON Web Token (JWT) and verifies its validity.
 *
 * This function uses a secret key from the environment variables to verify and decode the JWT.
 * If the token is valid, the decoded payload is returned.
 *
 * @param {string} jwtToken - The JWT to be decoded and verified.
 * @returns {Object} The decoded token payload.
 */
const decodeJwtToken = (jwtToken) => {
    let decodedToken;
    const jwtSecret = process.env.JWT_SECRET;
    decodedToken = jwt.verify(jwtToken, jwtSecret);
    return decodedToken;
}

module.exports = {
    generateJwtToken,
    decodeJwtToken
}