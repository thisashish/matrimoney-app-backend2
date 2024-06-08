const authController = require('../../controllers/authController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('Auth Controller', () => {
    describe('register', () => {
        // it('should register a user and send OTP', async () => {
        //     const req = {
        //         body: {
        //             email: 'test@example.com',
        //             password: 'Password123',
        //             confirm_password: 'Password123',
        //             phone: '1234567890'
        //         }
        //     };
        //     const res = {
        //         status: jest.fn().mockReturnThis(),
        //         json: jest.fn()
        //     };

        //     User.findOne.mockResolvedValue(null);
        //     User.prototype.save = jest.fn().mockResolvedValue();
        //     jwt.sign.mockReturnValue('token');

        //     await authController.register(req, res);

        //     expect(User.prototype.save).toHaveBeenCalled();
        //     expect(res.status).toHaveBeenCalledWith(201);
        //     expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        //         response: expect.objectContaining({
        //             message: 'User registered successfully'
        //         })
        //     }));
        // });

        it('should return 400 if passwords do not match', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'Password123',
                    confirm_password: 'Password456',
                    phone: '1234567890'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Passwords do not match' });
        });

        it('should return 400 if email already exists', async () => {
            const req = {
                body: {
                    email: 'existing@example.com',
                    password: 'Password123',
                    confirm_password: 'Password123',
                    phone: '1234567890'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findOne.mockResolvedValue({ email: 'existing@example.com' });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email already exists' });
        });

        it('should return 400 if phone number already exists', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'Password123',
                    confirm_password: 'Password123',
                    phone: '1234567890'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findOne.mockResolvedValue({ phone: '1234567890' });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Phone number already exists' });
        });

        it('should return 500 if there is a server error', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'Password123',
                    confirm_password: 'Password123',
                    phone: '1234567890'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findOne.mockRejectedValue(new Error('Database error'));

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Failed to register user'
            }));
        });
    });

    describe('login', () => {
        // it('should login a user with valid credentials', async () => {
        //     const req = {
        //         body: {
        //             email: 'test@example.com',
        //             password: 'Password123'
        //         }
        //     };
        //     const res = {
        //         status: jest.fn().mockReturnThis(),
        //         json: jest.fn()
        //     };

        //     const user = {
        //         email: 'test@example.com',
        //         password: 'hashedPassword',
        //         tokens: [],
        //         save: jest.fn()
        //     };

        //     User.findOne.mockResolvedValue(user);
        //     bcrypt.compare.mockResolvedValue(true);
        //     jwt.sign.mockReturnValue('token');

        //     await authController.login(req, res);

        //     expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashedPassword');
        //     expect(user.save).toHaveBeenCalled();
        //     expect(res.status).toHaveBeenCalledWith(200);
        //     expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        //         message: 'Login successful'
        //     }));
        // });

        it('should return 404 if user is not found', async () => {
            const req = {
                body: {
                    email: 'nonexistent@example.com',
                    password: 'Password123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findOne.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        // it('should return 401 if password is invalid', async () => {
        //     const req = {
        //         body: {
        //             email: 'test@example.com',
        //             password: 'WrongPassword'
        //         }
        //     };
        //     const res = {
        //         status: jest.fn().mockReturnThis(),
        //         json: jest.fn()
        //     };

        //     const user = {
        //         email: 'test@example.com',
        //         password: 'hashedPassword'
        //     };

        //     User.findOne.mockResolvedValue(user);
        //     bcrypt.compare.mockResolvedValue(false);

        //     await authController.login(req, res);

        //     expect(res.status).toHaveBeenCalledWith(401);
        //     expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' });
        // });

        it('should return 403 if the user is blocked', async () => {
            const req = {
                body: {
                    email: 'blocked@example.com',
                    password: 'Password123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = {
                email: 'blocked@example.com',
                password: 'hashedPassword',
                status: 'blocked'
            };

            User.findOne.mockResolvedValue(user);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Your account is blocked. Please contact customer support for assistance.' });
        });

        it('should return 500 if there is a server error', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'Password123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findOne.mockRejectedValue(new Error('Database error'));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Failed to login user'
            }));
        });
    });

    describe('verifyOTP', () => {
        it('should verify OTP successfully', async () => {
            const req = {
                body: {
                    otp: '123456'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = {
                otp: '123456',
                isOtpVerified: false,
                save: jest.fn().mockResolvedValue()
            };

            User.findOne.mockResolvedValue(user);

            await authController.verifyOTP(req, res);

            expect(user.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'OTP verified successfully'
            }));
        });

        it('should return 404 if user is not found', async () => {
            const req = {
                body: {
                    otp: '123456'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findOne.mockResolvedValue(null);

            await authController.verifyOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ statusCode: 404, message: 'User not found' });
        });

        it('should return 400 if no OTP is found for the user', async () => {
            const req = {
                body: {
                    otp: '123456'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = {
                otp: null
            };

            User.findOne.mockResolvedValue(user);

            await authController.verifyOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ statusCode: 400, message: 'No OTP found for the user' });
        });

        it('should return 400 if OTP is invalid', async () => {
            const req = {
                body: {
                    otp: '123456'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const user = {
                otp: '654321'
            };

            User.findOne.mockResolvedValue(user);

            await authController.verifyOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ statusCode: 400, message: 'Invalid OTP' });
        });

        it('should return 500 if there is a server error', async () => {
            const req = {
                body: {
                    otp: '123456'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            User.findOne.mockRejectedValue(new Error('Database error'));

            await authController.verifyOTP(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Failed to verify OTP'
            }));
        });
    });

    // Add more tests for other controller methods...
});
