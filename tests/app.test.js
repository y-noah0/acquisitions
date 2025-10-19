import app from '#src/app.js';
import request from 'supertest';

describe('API Endpoints', () => {
    describe('GET /health', () => {
        it('should return status OK with timestamp and uptime', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });

    describe('GET /api', () => {
        it('should return status OK with timestamp and uptime', async () => {
            const response = await request(app).get('/api');
            expect(response.status).toBe(200);
        });
    });
});
