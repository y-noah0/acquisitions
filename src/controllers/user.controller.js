import { userService } from '#services/user.service.js';
import { formatValidtionError } from '#utils/format.js';
import {
    updateUserSchema,
    userIdSchema,
} from '#validations/user.validation.js';
import logger from '#config/logger.js';

export const userController = {
    getUsers: async (req, res) => {
        try {
            const users = await userService.getUsers();
            res.status(200).json({
                message: 'Users fetched successfully',
                data: users,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getUserById: async (req, res) => {
        const { id } = req.params;
        try {
            const validationResult = userIdSchema.safeParse({ id });
            if (!validationResult.success) {
                return res.status(400).json({
                    error: 'Invalid user ID',
                    details: formatValidtionError(validationResult.error),
                });
            }

            const user = await userService.getUserById(
                validationResult.data.id
            );
            if (user.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({
                message: 'User fetched successfully',
                data: user[0],
            });
        } catch (error) {
            logger.error('Error in getUserById', error);
            res.status(500).json({ error: error.message });
        }
    },

    updateUser: async (req, res) => {
        const { id } = req.params;
        try {
            // Validate ID
            const idValidation = userIdSchema.safeParse({ id });
            if (!idValidation.success) {
                return res.status(400).json({
                    error: 'Invalid user ID',
                    details: formatValidtionError(idValidation.error),
                });
            }

            // Validate update data
            const updateValidation = updateUserSchema.safeParse(req.body);
            if (!updateValidation.success) {
                return res.status(400).json({
                    error: 'Invalid update data',
                    details: formatValidtionError(updateValidation.error),
                });
            }

            const userId = idValidation.data.id;
            const updates = updateValidation.data;

            // Check if user is trying to update themselves or is admin
            if (req.user.id !== userId && req.user.role !== 'admin') {
                return res
                    .status(403)
                    .json({
                        error: 'Forbidden: You can only update your own profile',
                    });
            }

            // Only admins can change role
            if (updates.role && req.user.role !== 'admin') {
                return res
                    .status(403)
                    .json({
                        error: 'Forbidden: Only admins can change user roles',
                    });
            }

            const updatedUser = await userService.updateUser(userId, updates);

            logger.info(
                `User updated: ${updatedUser.email} by ${req.user.email}`
            );
            res.status(200).json({
                message: 'User updated successfully',
                data: updatedUser,
            });
        } catch (error) {
            logger.error('Error in updateUser', error);
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(500).json({ error: error.message });
        }
    },

    deleteUser: async (req, res) => {
        const { id } = req.params;
        try {
            // Validate ID
            const validationResult = userIdSchema.safeParse({ id });
            if (!validationResult.success) {
                return res.status(400).json({
                    error: 'Invalid user ID',
                    details: formatValidtionError(validationResult.error),
                });
            }

            const userId = validationResult.data.id;

            // Check if user is trying to delete themselves or is admin
            if (req.user.id !== userId && req.user.role !== 'admin') {
                return res
                    .status(403)
                    .json({
                        error: 'Forbidden: You can only delete your own account',
                    });
            }

            const result = await userService.deleteUser(userId);

            logger.info(`User deleted: ID ${userId} by ${req.user.email}`);
            res.status(200).json({
                message: result.message,
            });
        } catch (error) {
            logger.error('Error in deleteUser', error);
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(500).json({ error: error.message });
        }
    },
};
