const generateBadResponse = (res, code, message) => {
    return res.status(code).json({ message });
}

module.exports = {
    generateBadResponse
}