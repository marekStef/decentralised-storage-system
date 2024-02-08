require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateJwtToken = (appId, nameDefinedByUser, nameDefinedByApp) => {
    const jwtPayload = {
        appId,
        nameDefinedByUser,
        nameDefinedByApp
    };

    const jwtSecret = process.env.JWT_SECRET || 'not_safe_secret_key'; 
    const jwtOptions = { expiresIn: '300y' }; // maybe change ?
    const jwtToken = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
    return jwtToken;
}

module.exports = {
    generateJwtToken
}