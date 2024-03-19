const crypto = require('crypto');

function generateHash(object) {
    const jsonString = JSON.stringify(object);

    // Create SHA-256 hash
    return crypto.createHash('sha256').update(jsonString).digest('hex');
}

// Function to compare two objects by their hashes
function compareObjects(obj1, obj2) {
    const hash1 = generateHash(obj1);
    const hash2 = generateHash(obj2);

    return hash1 === hash2;
}

module.exports = {
    generateHash,
    compareObjects
}