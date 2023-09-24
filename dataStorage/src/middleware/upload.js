const multer = require('multer');
const {v4: uuidv4} = require("uuid");

// Set up storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, `${uuidv4()}-${Date.now()}.${file.mimetype.split('/')[1]}`);
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit to 1MB
});

module.exports = upload;