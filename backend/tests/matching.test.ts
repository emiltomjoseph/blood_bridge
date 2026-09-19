import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Matching Pipeline & Lifecycle Integration Tests', () => {
  it('should return 401 UNAUTHORIZED when executing matching without auth header', async () => {
    const res = await request(app).post('/api/requests/req-123/match');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 FORBIDDEN when DONOR attempts to run hospital matching endpoint', async () => {
    const res = await request(app)
      .post('/api/requests/req-123/match')
      .set('Authorization', 'Bearer mock-token-donor-1')
      .set('x-mock-role', 'DONOR');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 404 NOT_FOUND when attempting matching on non-existent blood request', async () => {
    const res = await request(app)
      .post('/api/requests/non-existent-request-id/match')
      .set('Authorization', 'Bearer mock-token-hosp-1')
      .set('x-mock-role', 'HOSPITAL');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('REQUEST_NOT_FOUND');
  });

  it('should return 404 NOT_FOUND when donor attempts to accept non-existent match', async () => {
    const res = await request(app)
      .post('/api/matches/non-existent-match-id/accept')
      .set('Authorization', 'Bearer mock-token-donor-1')
      .set('x-mock-role', 'DONOR');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('MATCH_NOT_FOUND');
  });

  it('should return 404 NOT_FOUND when donor attempts to decline non-existent match', async () => {
    const res = await request(app)
      .post('/api/matches/non-existent-match-id/reject')
      .set('Authorization', 'Bearer mock-token-donor-1')
      .set('x-mock-role', 'DONOR');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('MATCH_NOT_FOUND');
  });
});
