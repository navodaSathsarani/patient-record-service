const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const patientRoutes = require('../app'); // Adjust path based on your directory structure

const app = express();
app.use(express.json());
app.use('/api/patient-record-service', patientRoutes);

beforeAll(async () => {
    // Connect to a test MongoDB database
    const TEST_DB_URI = "mongodb+srv://navodasathsarani:chQf3ctN1Xwx7H6s@health-sync-mongo-db.okigg.mongodb.net/health-db?retryWrites=true&w=majority&appName=health-sync-mongo-db";
    await mongoose.connect(TEST_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Patient API Endpoints', () => {
    let createdPatientId;

    test('POST /api/patient-record-service/patients - Create a new patient', async () => {
        const response = await request(app)
            .post('/api/patient-record-service/patients')
            .send({
                name: 'John Doe',
                age: 35,
                gender: 'Male',
                medicalHistory: ['Diabetes'],
                prescriptions: ['Metformin'],
                labResults: ['Blood Test: Normal']
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('message', 'Patient record is created successfully');
        expect(response.body.patient).toHaveProperty('_id');
        createdPatientId = response.body.patient._id; // Save ID for later tests
    });

    test('GET /api/patient-record-service/patients - Get all patients', async () => {
        const response = await request(app).get('/api/patient-record-service/patients');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/patient-record-service/patients/:id - Get patient by ID', async () => {
        const response = await request(app).get(`/api/patient-record-service/patients/${createdPatientId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'John Doe');
    });

    test('PUT /api/patient-record-service/patients/:id - Update a patient', async () => {
        const response = await request(app)
            .put(`/api/patient-record-service/patients/${createdPatientId}`)
            .send({
                age: 36,
                prescriptions: ['Metformin', 'Vitamin D']
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Patient record updated successfully');
        expect(response.body.patient).toHaveProperty('age', 36);
        expect(response.body.patient.prescriptions).toContain('Vitamin D');
    });

    test('DELETE /api/patient-record-service/patients/:id - Delete a patient', async () => {
        const response = await request(app).delete(`/api/patient-record-service/patients/${createdPatientId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Patient record deleted successfully');
    });

    test('GET /api/patient-record-service/patients/:id - Get non-existent patient', async () => {
        const response = await request(app).get(`/api/patient-record-service/patients/${createdPatientId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message', 'Patient not found');
    });
});
