

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const appRoutes = require('./app'); // Import app.js routes
const app = express();
app.use(bodyParser.json());

const PORT =  3001;
const BASE_PATH = '/api/v1/patient-record-service';

app.use(BASE_PATH, appRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Patient Record Service is running on port ${PORT}`);
});
