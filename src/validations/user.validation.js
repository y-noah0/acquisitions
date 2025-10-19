import { z } from 'zod';

export const userIdSchema = z.object({
    id: z
        .string()
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0, {
            message: 'ID must be a positive integer',
        }),
});

export const updateUserSchema = z.object({
    name: z.string().min(2).max(255).trim().optional(),
    email: z
        .string()
        .email()
        .max(255)
        .transform(email => email.toLowerCase().trim())
        .optional(),
    role: z.enum(['user', 'admin']).optional(),
});
