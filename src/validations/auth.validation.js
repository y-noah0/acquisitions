import { z } from 'zod';

export const signUpSchema = z.object({
    name: z.string().min(2).max(255).trim(),
    email: z
        .string()
        .email()
        .max(255)
        .transform(email => email.toLowerCase().trim()),
    password: z.string().min(6).max(128),
    role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
    email: z
        .string()
        .email()
        .transform(email => email.toLowerCase().trim()),
    password: z.string().min(1),
});
