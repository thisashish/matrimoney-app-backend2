const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('../../controllers/usersController');
const User = require('../../models/User');
const authenticateUser = require('../../middleware/authMiddleware');

const app = express();
app.use(bodyParser.json());

// Mock middleware
jest.mock('../../middleware/authMiddleware', () => jest.fn((req, res, next) => {
    req.userData = { userId: 'mockUserId' };
    next();
}));

// Mock the User model
jest.mock('../../models/User');

// Mock routes
app.post('/api/user/additional-info/:userId', authenticateUser, userController.enterAdditionalInfo);
app.get('/api/user/additional-info/:userId', authenticateUser, userController.getAdditionalInfo);
app.post('/api/user/:userId/opposite-gender-users', authenticateUser, userController.getOppositeGenderUsers);
app.get('/api/user/matches', authenticateUser, userController.getMatches);
app.post('/api/user/block/:userId', authenticateUser, userController.blockUser);
app.post('/api/user/unblock/:userId', authenticateUser, userController.unblockUser);

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // enterAdditionalInfo test cases
    describe('enterAdditionalInfo', () => {
        it('should return 404 if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/user/additional-info/mockUserId')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    gender: 'Male',
                    dateOfBirth: '1990-01-01'
                });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('should update user info and return 200', async () => {
            const mockUser = {
                save: jest.fn().mockResolvedValue(true),
                firstName: 'John',
                lastName: 'Doe',
                gender: 'Male',
                dateOfBirth: '1990-01-01',
                age: 30
            };

            User.findOne.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/api/user/additional-info/mockUserId')
                .send({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    gender: 'Female',
                    dateOfBirth: '1992-02-02'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Additional information saved successfully' });
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockUser.firstName).toBe('Jane');
            expect(mockUser.lastName).toBe('Doe');
            expect(mockUser.gender).toBe('Female');
            expect(mockUser.dateOfBirth).toBe('1992-02-02');
        });

        it('should handle errors and return 500', async () => {
            const errorMessage = 'Database error';
            User.findOne.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .post('/api/user/additional-info/mockUserId')
                .send({
                    firstName: 'Miya',
                    lastName: 'Doe',
                    gender: 'Female',
                    dateOfBirth: '1992-02-02'
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to save additional information', error: errorMessage });
        });
    });

    // getAdditionalInfo test cases
    describe('getAdditionalInfo', () => {
        it('should return 404 if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/user/additional-info/mockUserId');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('should return user info and return 200', async () => {
            const mockUser = {
                userId: 'mockUserId',
                firstName: 'John',
                lastName: 'Doe',
                gender: 'Male',
                dateOfBirth: '1990-01-01'
            };

            User.findOne.mockResolvedValue(mockUser);

            const response = await request(app)
                .get('/api/user/additional-info/mockUserId');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ user: mockUser });
        });

        it('should handle errors and return 500', async () => {
            const errorMessage = 'Database error';
            User.findOne.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .get('/api/user/additional-info/mockUserId');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to retrieve user information', error: errorMessage });
        });
    });

    // getOppositeGenderUsers test cases
    describe('getOppositeGenderUsers', () => {
        it('should return 404 if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/user/mockUserId/opposite-gender-users');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('should return opposite gender users and return 200', async () => {
            const mockUser = {
                _id: 9043080385,
                userId:'sklds345',
                gender: 'Male',
                blockedUsers: [],
                receivedRequests: [],
                sentRequests: []
            };
            const mockOppositeGenderUsers = [
                { _id: 'user1', gender: 'Female' },
                { _id: 'user2', gender: 'Female' }
            ];

            User.findOne.mockResolvedValue(mockUser);
            User.find.mockResolvedValue(mockOppositeGenderUsers);

            const response = await request(app)
                .post('/api/user/mockUserId/opposite-gender-users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ oppositeGenderUsers: mockOppositeGenderUsers });
        });

        it('should handle errors and return 500', async () => {
            const errorMessage = 'Database error';
            User.findOne.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .post('/api/user/mockUserId/opposite-gender-users');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to retrieve opposite gender users', error: errorMessage });
        });
    });

    // getMatches test cases
    describe('getMatches', () => {
        it('should return 404 if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/user/matches');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('should return matches and return 200', async () => {
            const mockUser = {
                userId: 'mockUserId',
                gender: 'Male',
                blockedUsers: [],
                receivedRequests: [],
                sentRequests: []
            };
            const mockOppositeGenderUsers = [
                { _id: 'user1', gender: 'Female' },
                { _id: 'user2', gender: 'Female' }
            ];

            User.findOne.mockResolvedValue(mockUser);
            User.find.mockResolvedValue(mockOppositeGenderUsers);

            const response = await request(app)
                .get('/api/user/matches');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ matches: mockOppositeGenderUsers });
        });

        it('should handle errors and return 500', async () => {
            const errorMessage = 'Database error';
            User.findOne.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .get('/api/user/matches');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to retrieve matches', error: errorMessage });
        });
    });

    // blockUser test cases
    describe('blockUser', () => {
        it('should return 404 if authenticated user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/user/block/mockUserIdToBlock');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Authenticated user not found' });
        });

        it('should block user and return 200', async () => {
            const mockAuthenticatedUser = {
                userId: 'mockUserId',
                blockedUsers: [],
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockAuthenticatedUser);

            const response = await request(app)
                .post('/api/user/block/mockUserIdToBlock');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'User blocked successfully' });
            expect(mockAuthenticatedUser.blockedUsers).toContain('mockUserIdToBlock');
            expect(mockAuthenticatedUser.save).toHaveBeenCalled();
        });

        it('should handle errors and return 500', async () => {
            const errorMessage = 'Database error';
            User.findOne.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .post('/api/user/block/mockUserIdToBlock');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to block user', error: errorMessage });
        });
    });

    // unblockUser test cases
    describe('unblockUser', () => {
        it('should return 404 if authenticated user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/user/unblock/mockUserId');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Authenticated user not found' });
        });

        it('should unblock user and return 200', async () => {
            const mockAuthenticatedUser = {
                userId: 'mockUserId',
                blockedUsers: ['mockUserIdToUnblock'],
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockAuthenticatedUser);

            const response = await request(app)
                .post('/api/user/unblock/mockUserIdToUnblock');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'User unblocked successfully' });
            expect(mockAuthenticatedUser.blockedUsers).not.toContain('mockUserIdToUnblock');
            expect(mockAuthenticatedUser.save).toHaveBeenCalled();
        });

        it('should return 404 if user to unblock is not in blocked list', async () => {
            const mockAuthenticatedUser = {
                userId: 'mockUserId',
                blockedUsers: [],
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockAuthenticatedUser);

            const response = await request(app)
                .post('/api/user/unblock/mockUserIdToUnblock');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'User not found in blocked list' });
        });

        it('should handle errors and return 500', async () => {
            const errorMessage = 'Database error';
            User.findOne.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .post('/api/user/unblock/mockUserIdToUnblock');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to unblock user', error: errorMessage });
        });
    });
});
