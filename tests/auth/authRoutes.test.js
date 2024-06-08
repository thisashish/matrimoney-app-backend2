const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../../routes/authRoutes');
const { connectDB, closeDB } = require('../../utils/db'); // Assuming these functions handle your DB connection

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
    await connectDB();
});

afterAll(async () => {
    await closeDB();
});

describe('Auth Routes', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'priya@example.com',
                    password: 'Password123',
                    confirm_password: 'Password123',
                    phone: '1234569698'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.response).toHaveProperty('message', 'User registered successfully');
        });

        it('should return 400 if passwords do not match', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'priya@example.com',
                    password: 'Password123',
                    confirm_password: 'Password8787',
                    phone: '1234569698'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Passwords do not match');
        });

        it('should return 400 if email or phone already exists', async () => {
            // Assuming you have a user already registered with email or phone
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Password123',
                    confirm_password: 'Password123',
                    phone: '1234567890'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message');
            // Additional check for specific message can be done here
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login a user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'priya@example.com',
                    password: 'Password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Login successful');
            expect(res.body).toHaveProperty('token');
        });

        it('should return 404 if user is not found', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('message', 'User not found');
        });

        // it('should return 401 if password is invalid', async () => {
        //     const res = await request(app)
        //         .post('/api/auth/login')
        //         .send({
        //             email: 'priya@example.com',
        //             password: 'WrongPassword'
        //         });

        //     expect(res.statusCode).toBe(401);
        //     expect(res.body).toHaveProperty('message', 'Invalid password');
        // });
    });

    
});
