import logger from '#config/logger.js';
import { createUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { formatValidtionError } from '#utils/format.js';
import { jwtToken } from '#utils/jwt.js';
import { signIn } from '#services/auth.service.js';
import { signUpSchema } from '#validations/auth.validation.js';
import { signInSchema } from '#validations/auth.validation.js';

export const signup = async (req, res, next) => {
    try {
        const validationResult = signUpSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid signup data',
                details: formatValidtionError(validationResult.error),
            });
        }

        const { name, email, role, password } = validationResult.data;

        const user = await createUser({ name, email, password, role });

        const token = jwtToken.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        cookies.set(res, 'token', token);

        logger.info(`User signed up: ${user.email} with role: ${user.role}`);
        res.status(201).json({
            message: 'User signed up successfully',
            user: { name, email, role },
        });
    } catch (error) {
        logger.error('signup error', error);

        if (error.message == 'user exists') {
            return res.status(409).json({ error: 'User with email exists' });
        }
        next(error);
    }
};

export const signin = async (req, res, next) => {
    try {
        const validationResult = signInSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Invalid signin data',
                details: formatValidtionError(validationResult.error),
            });
        }

        const { email, password } = validationResult.data;

        const user = await signIn({ email, password });

        const token = jwtToken.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        cookies.set(res, 'token', token);

        logger.info(`User signed in: ${user.email}`);
        res.status(200).json({
            message: 'User signed in successfully',
            user: { name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        logger.error('signin error', error);

        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        next(error);
    }
};

export const signout = async (req, res) => {
    try {
        cookies.clear(res, 'token');
        logger.info('User signed out');
        res.status(200).json({ message: 'User signed out successfully' });
    } catch (error) {
        logger.error('signout error', error);
        res.status(500).json({ error: 'Signout failed' });
    }
};
