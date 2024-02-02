const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
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
  res.send({ message: 'Files uploaded successfully', files: req.files.map(file => file.originalname) });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
