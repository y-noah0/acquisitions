import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';
const JWT_EXPIRES_IN = '1d';

export const jwtToken = {
    sign: payload => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            logger.error('Error signing JWT:', error);
            throw new Error('Could not sign JWT');
        }
    },
    verify: token => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Error verifying JWT:', error);
            throw new Error('Invalid or expired JWT');
        }
    },
};
