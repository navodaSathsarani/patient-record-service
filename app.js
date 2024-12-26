
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
mongoose.connect('mongodb+srv://navodasathsarani:chQf3ctN1Xwx7H6s@health-sync-mongo-db.okigg.mongodb.net/health-db?retryWrites=true&w=majority&appName=health-sync-mongo-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));
const router = express.Router();
router.use(bodyParser.json());



const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    medicalHistory: { type: [String], default: [] },
    prescriptions: { type: [String], default: [] },
    labResults: { type: [String], default: [] }
});

const Patient = mongoose.model('Patient', patientSchema);

// Health Check Routes
let healthy = true;

// Set unhealthy status
router.use('/unhealthy', (req, res) => {
    healthy = false;
    res.status(200).json({ healthy });
});

// Liveness Check
router.use('/healthcheck', (req, res, next) => {
    if (healthy) {
        next();
    } else {
        next(new Error('unhealthy'));
    }
});

// Readiness Check
router.use('/readiness', (req, res) => {
    res.status(200).json({ ready: true });
});

// API Routes

// Create a new patient
router.post('/patients', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json({ message: 'Patient record created successfully', patient });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all patients
router.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific patient by ID
router.get('/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a patient record
router.put('/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient record updated successfully', patient });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a patient record
router.delete('/patients/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
