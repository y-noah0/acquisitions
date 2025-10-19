import logger from '#config/logger.js';
import { jwtToken } from '#utils/jwt.js';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwtToken.verify(token);
        req.user = decoded;

        next();
    } catch (error) {
        logger.error('Authentication error', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const requireRole = role => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res
                .status(403)
                .json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
