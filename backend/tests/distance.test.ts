import { describe, it, expect } from 'vitest';
import { DistanceService } from '../src/services/matching/distance.service';

describe('Haversine Distance Service Tests', () => {
  it('should return 0 km for identical coordinates', () => {
    const dist = DistanceService.calculateDistanceKm(9.9312, 76.2673, 9.9312, 76.2673);
    expect(dist).toBe(0);
  });

  it('should accurately calculate distance between Ernakulam (9.9312, 76.2673) and Trivandrum (8.5241, 76.9366)', () => {
    const dist = DistanceService.calculateDistanceKm(9.9312, 76.2673, 8.5241, 76.9366);
    // Approximate straight-line distance is ~170 to 180 km
    expect(dist).toBeGreaterThan(160);
    expect(dist).toBeLessThan(190);
  });

  it('should be symmetric: dist(A, B) === dist(B, A)', () => {
    const dist1 = DistanceService.calculateDistanceKm(9.9312, 76.2673, 11.2588, 75.7804);
    const dist2 = DistanceService.calculateDistanceKm(11.2588, 75.7804, 9.9312, 76.2673);
    expect(dist1).toBe(dist2);
  });

  it('should throw error for out-of-bounds latitude or longitude', () => {
    expect(() => DistanceService.calculateDistanceKm(95, 76, 9, 76)).toThrow('INVALID_LATITUDE_RANGE');
    expect(() => DistanceService.calculateDistanceKm(9, 185, 9, 76)).toThrow('INVALID_LONGITUDE_RANGE');
  });
});
