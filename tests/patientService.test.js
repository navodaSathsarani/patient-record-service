const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Import the app instance

describe('Patient Record Service Integration Tests', () => {
  beforeAll(async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(
      'mongodb+srv://navodasathsarani:chQf3ctN1Xwx7H6s@health-sync-mongo-db.okigg.mongodb.net/health-db?retryWrites=true&w=majority&appName=health-sync-mongo-db',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('Connected to MongoDB');
  });

  afterAll(async () => {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  });

  jest.setTimeout(10000); // Increase timeout to 10 seconds

  it('should create a new patient', async () => {
    const response = await request(app)
      .post('/patients')
      .send({
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        medicalHistory: ['Diabetes'],
        prescriptions: ['Metformin'],
        labResults: ['Blood Test: Normal'],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.patient.name).toBe('John Doe');
  });

  it('should retrieve all patients', async () => {
    const response = await request(app).get('/patients');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
