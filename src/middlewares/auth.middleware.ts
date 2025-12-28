import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      res.status(401).json({ error: 'Token error' });
      return;
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      res.status(401).json({ error: 'Token malformatted' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'default-secret';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Token invalid' });
        return;
      }

      const payload = decoded as { id: string; email: string };
      req.user = {
        id: payload.id,
        email: payload.email,
      };

      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Token invalid' });
  }
};
