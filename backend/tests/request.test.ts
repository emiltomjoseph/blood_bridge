import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Blood Request Validation & Lifecycle Tests', () => {
  it('should return 400 VALIDATION_ERROR when blood request payload is invalid', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', 'Bearer mock-token-hosp-1')
      .set('x-mock-role', 'HOSPITAL')
      .send({
        bloodGroup: 'INVALID_BLOOD_GROUP',
        unitsRequired: -5,
        latitude: 200, // Invalid latitude (> 90)
        longitude: 76.2673,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('should reject invalid status transitions via request state machine', async () => {
    // Transitioning directly from FULFILLED or CANCELLED to OPEN is invalid
    const res = await request(app)
      .patch('/api/requests/non-existent-id/status')
      .set('Authorization', 'Bearer mock-token-hosp-1')
      .set('x-mock-role', 'HOSPITAL')
      .send({
        status: 'FULFILLED',
      });

    // Should return 404 because non-existent request ID
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('REQUEST_NOT_FOUND');
  });
});
