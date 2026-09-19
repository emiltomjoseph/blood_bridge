import { describe, it, expect } from 'vitest';
import { RankingService } from '../src/services/matching/ranking.service';
import { UrgencyLevel, VerificationStatus } from '@prisma/client';

describe('Priority Ranking Service Tests', () => {
  it('should assign a higher score to a closer donor', () => {
    const scoreClose = RankingService.calculateMatchScore({
      donorId: 'donor-1',
      distanceKm: 2.0,
      urgency: UrgencyLevel.URGENT,
      verificationStatus: VerificationStatus.VERIFIED,
    });

    const scoreFar = RankingService.calculateMatchScore({
      donorId: 'donor-2',
      distanceKm: 25.0,
      urgency: UrgencyLevel.URGENT,
      verificationStatus: VerificationStatus.VERIFIED,
    });

    expect(scoreClose).toBeGreaterThan(scoreFar);
  });

  it('should assign a higher score for CRITICAL urgency vs NORMAL urgency', () => {
    const scoreCritical = RankingService.calculateMatchScore({
      donorId: 'donor-1',
      distanceKm: 5.0,
      urgency: UrgencyLevel.CRITICAL,
      verificationStatus: VerificationStatus.VERIFIED,
    });

    const scoreNormal = RankingService.calculateMatchScore({
      donorId: 'donor-1',
      distanceKm: 5.0,
      urgency: UrgencyLevel.NORMAL,
      verificationStatus: VerificationStatus.VERIFIED,
    });

    expect(scoreCritical).toBeGreaterThan(scoreNormal);
  });

  it('should deterministically sort candidates by Match Priority Score, then distance, then donorId', () => {
    const candidates = [
      { candidate: { donorId: 'donor-B' }, distanceKm: 5.0, matchScore: 80 },
      { candidate: { donorId: 'donor-A' }, distanceKm: 2.0, matchScore: 95 },
      { candidate: { donorId: 'donor-C' }, distanceKm: 5.0, matchScore: 80 },
    ];

    const ranked = RankingService.rankCandidates(candidates);

    expect(ranked[0].candidate.donorId).toBe('donor-A'); // Highest score (95)
    expect(ranked[1].candidate.donorId).toBe('donor-B'); // Score 80, donor-B (alphabetical tie-breaker)
    expect(ranked[2].candidate.donorId).toBe('donor-C'); // Score 80, donor-C
  });
});
