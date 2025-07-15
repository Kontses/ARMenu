const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 5000; // Αλλαγή πόρτας σε 5000

// Enable CORS for all routes
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // Use absolute path for robustness
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('Γεια σου από το backend του AR Menu Editor!');
});

// Endpoint to handle file uploads
app.post('/upload', upload.single('glbFile'), (req, res) => {
  if (req.file) {
    console.log('Αρχείο ανεβασμένο:', req.file.filename);
    res.status(200).send('Το αρχείο ανεβάστηκε επιτυχώς!');
  } else {
    res.status(400).send('Δεν ανεβάστηκε αρχείο.');
  }
});

app.listen(port, () => {
  console.log(`Ο server τρέχει στο http://localhost:${port}`);
}); 