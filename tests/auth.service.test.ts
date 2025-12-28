import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../src/services/auth.service';
import { User } from '../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../src/models/User');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as any);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-token');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw error if email already exists', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ email: 'test@example.com' } as any);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should hash password before saving', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      vi.mocked(User.create).mockResolvedValue(mockUser as any);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as any);

      await authService.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
    });
  });

  describe('login', () => {
    it('should successfully login with correct credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as any);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-token');
    });

    it('should throw error if user does not exist', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should compare provided password with stored hash', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as any);

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should generate JWT token on successful login', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as any);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBe('mock-token');
    });
  });
});
