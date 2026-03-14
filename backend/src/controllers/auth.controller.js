import { registerUser, loginUser } from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw { statusCode: 400, message: 'Please provide name, email, and password' };
    }
    const result = await registerUser(email, password, name);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw { statusCode: 400, message: 'Please provide email and password' };
    }
    const result = await loginUser(email, password);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: { userId: req.user.userId } });
};
