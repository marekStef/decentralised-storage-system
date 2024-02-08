require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateJwtToken = (appId, nameDefinedByUser, nameDefinedByApp) => {
    const jwtPayload = {
        appId,
        nameDefinedByUser,
        nameDefinedByApp
    };

    const jwtSecret = process.env.JWT_SECRET;
    const jwtOptions = {expiresIn: '300y'}; // maybe change ?
    const jwtToken = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
    return jwtToken;
}

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