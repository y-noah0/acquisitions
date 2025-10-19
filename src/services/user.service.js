import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const userService = {
    getUsers: async () => {
        try {
            return await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                })
                .from(users);
        } catch (e) {
            logger.error('Error fetching users', { error: e.message });
            throw new Error(e);
        }
    },

    getUserById: async id => {
        try {
            return await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                })
                .from(users)
                .where(eq(users.id, id));
        } catch (e) {
            logger.error('Error fetching user by ID', {
                error: e.message,
                userId: id,
            });
            throw new Error(e);
        }
    },

    updateUser: async (id, userData) => {
        try {
            // First check if user exists
            const existingUser = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (existingUser.length === 0) {
                throw new Error('User not found');
            }

            const updatedUser = await db
                .update(users)
                .set({ ...userData, updatedAt: new Date() })
                .where(eq(users.id, id))
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: users.role,
                    updatedAt: users.updatedAt,
                });

            return updatedUser[0];
        } catch (e) {
            logger.error('Error updating user', {
                error: e.message,
                userId: id,
            });
            throw new Error(e);
        }
    },

    deleteUser: async id => {
        try {
            // First check if user exists
            const existingUser = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.id, id))
                .limit(1);

            if (existingUser.length === 0) {
                throw new Error('User not found');
            }

            await db.delete(users).where(eq(users.id, id));

            return { message: 'User deleted successfully' };
        } catch (e) {
            logger.error('Error deleting user', {
                error: e.message,
                userId: id,
            });
            throw new Error(e);
        }
    },
};
