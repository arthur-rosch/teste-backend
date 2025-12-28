import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RegisterDTO, LoginDTO } from '../types';

export class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
    });

    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    };
  }

  async login(data: LoginDTO) {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id.toString(), user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    };
  }

  private generateToken(id: string, email: string): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ id, email }, secret, { expiresIn });
  }
}
