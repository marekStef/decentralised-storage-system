const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 3000;

const uploadsDirectory = './uploads';
fs.existsSync(uploadsDirectory) || fs.mkdirSync(uploadsDirectory, { recursive: true });

// helpers [START]
const generateUniqueNameForFile = (file) => {
  // Generate a unique prefix using a timestamp and a random number
  const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E12);
  console.log('unique prefix - ', uniquePrefix);
  // Return the unique filename by combining the prefix with the original file extension
  return uniquePrefix + '-' + file.originalname;
};

// helpers [END]

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, generateUniqueNameForFile(file));
  }
});

const upload = multer({ storage: storage });

// Single image route
app.post('/upload', upload.single('image'), (req, res) => {
  console.log('File received:', req.file.originalname);
  res.send({ message: 'File uploaded successfully', file: req.file.originalname });
});

// Multiple images route
app.post('/uploads', upload.array('images'), (req, res) => {
  console.log('Files received:', req.files.map(file => file.originalname));
  res.send({ message: 'Files uploaded successfully', ids: req.files.map(file => file.originalname) });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
