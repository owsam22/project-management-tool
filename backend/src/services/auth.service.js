import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const registerUser = async (email, password, name) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { statusCode: 400, message: 'User already exists with this email' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ email, passwordHash, name });

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    user: { id: user._id, email: user.email, name: user.name },
    token,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    user: { id: user._id, email: user.email, name: user.name },
    token,
  };
};
