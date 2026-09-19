import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Auth & Role Middleware Integration Tests', () => {
  it('should return 401 UNAUTHORIZED when no authorization header is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 UNAUTHORIZED when malformed bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic 12345');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 403 FORBIDDEN when user role does not match required endpoint role', async () => {
    // Attempting to post to /api/hospitals with DONOR role
    const res = await request(app)
      .post('/api/hospitals')
      .set('Authorization', 'Bearer mock-token-user-donor-1')
      .set('x-mock-role', 'DONOR')
      .send({
        name: 'District Hospital',
        address: '123 Main St',
        district: 'Ernakulam',
        latitude: 9.9312,
        longitude: 76.2673,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
