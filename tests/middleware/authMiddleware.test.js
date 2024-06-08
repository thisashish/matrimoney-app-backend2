const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../../middleware/authMiddleware');

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  it('should call next() if authentication is successful', () => {
    const req = { headers: { authorization: 'Bearer validToken' } };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockResolvedValue({ userId: 'mockUserId' });

    authenticateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userData).toEqual({ userId: 'mockUserId' });
  });

  it('should return 401 if authentication fails', () => {
    const req = { headers: { authorization: 'Bearer invalidToken' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Auth failed' });
    expect(next).not.toHaveBeenCalled();
  });
});
