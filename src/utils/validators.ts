import { z } from 'zod';
import { ServiceStatus } from '../types';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createOrderSchema = z.object({
  lab: z.string().min(1, 'Lab is required'),
  patient: z.string().min(1, 'Patient is required'),
  customer: z.string().min(1, 'Customer is required'),
  services: z
    .array(
      z.object({
        name: z.string().min(1, 'Service name is required'),
        value: z.number().positive('Service value must be greater than 0'),
        status: z.nativeEnum(ServiceStatus).optional(),
      })
    )
    .min(1, 'At least one service is required'),
});
