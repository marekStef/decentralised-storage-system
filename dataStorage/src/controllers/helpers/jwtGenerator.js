require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateJwtToken = (jwtPayload, jwtOptions = {expiresIn: '300y'}) => {
    const jwtSecret = process.env.JWT_SECRET;
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