import bcrypt from 'bcrypt';
import logger from '#config/logger.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';
import { db } from '#config/database.js';

export const hashPassword = async password => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (e) {
        logger.error('Error hashing password:', e);
        throw new Error('Password hashing failed');
    }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
    try {
        // Check if user exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if (existingUser.length > 0) {
            throw new Error('User already exists with this email');
        }

        const passwordHash = await hashPassword(password);
        const [newUser] = await db
            .insert(users)
            .values({ name, email, password: passwordHash, role })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            });

        logger.info(`User ${newUser.email} created successfully`);
        return newUser;
    } catch (e) {
        logger.error('Error creating user:', e);
        if (e.message.includes('already exists')) {
            throw new Error('User already exists with this email');
        }
        if (e.code === '42601' || e.message.includes('Failed query')) {
            throw new Error('Database query error');
        }
        throw new Error('User creation failed');
    }
};

export const signIn = async ({ email, password }) => {
    try {
        // Find user by email
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        logger.info(`User signed in: ${user.email}`);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    } catch (e) {
        logger.error('Error signing in user:', e);
        throw e;
    }
};
