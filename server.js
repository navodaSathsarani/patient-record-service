

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const appRoutes = require('./app'); // Import app.js routes
const app = express();
app.use(bodyParser.json());

// Environment Variables
const PORT = process.env.PORT || 3001;
const BASE_PATH = process.env.BASE_PATH || '/api/v1/patient-record-service';
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
// mongoose.connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

// Use Base Path for Routes
app.use(BASE_PATH, appRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Patient Record Service is running on port ${PORT}`);
});
