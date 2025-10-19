import aj from '#config/arcject.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

export const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || 'guest';

        let limit;
        let message;

        switch (role) {
            case 'admin':
                limit = 20;
                message = 'Admin rate limit exceeded';
                break;
            case 'user':
                limit = 10;
                message = 'User rate limit exceeded';
                break;
            case 'guest':
                limit = 5;
                message = 'Guest rate limit exceeded';
                break;

            default:
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '1m',
                max: limit,
                name: `${role}-rate-limit`,
            })
        );
        const descision = await client.protect(req);
        logger.info('Arcjet decision', {
            isDenied: descision.isDenied(),
            reason: descision.reason?.toString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
        });
        if (descision.isDenied && descision.reason.isBot()) {
            logger.warn('Blocked bot request', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
            });
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Bot traffic is not allowed',
            });
        }
        if (descision.isDenied && descision.reason.isShield()) {
            logger.warn('Blocked shield request', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
            });
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Suspicious activity detected',
            });
        }
        if (descision.isDenied && descision.reason.isRateLimit()) {
            logger.warn('Blocked rate limit exceeded request', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path,
                method: req.method,
            });
            return res.status(403).json({
                error: 'Forbidden',
                message,
            });
        }
        next();
    } catch (e) {
        console.error('Security middleware error:', e);
        res.status(500).json({
            error: 'Internal server error',
            message: 'something went wrong security middleware',
        });
    }
};
