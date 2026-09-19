import { UrgencyLevel, VerificationStatus } from '@prisma/client';

export interface RankingInput {
  donorId: string;
  distanceKm: number;
  urgency: UrgencyLevel;
  verificationStatus: VerificationStatus;
  lastDonationDate?: Date | null;
}

export class RankingService {
  public static readonly WEIGHTS = {
    MAX_DISTANCE_POINTS: 50,
    DISTANCE_PENALTY_PER_KM: 1.5,
    URGENCY_POINTS: {
      CRITICAL: 30,
      URGENT: 20,
      NORMAL: 10,
    },
    VERIFICATION_POINTS: 15,
    DONATION_RECENCY_BONUS: 5,
  };

  /**
   * Deterministically calculates Match Priority Score (range: 0 - 100).
   */
  static calculateMatchScore(input: RankingInput): number {
    const { distanceKm, urgency, verificationStatus, lastDonationDate } = input;

    // 1. Distance Component (Max 50 pts)
    const distancePoints = Math.max(
      0,
      RankingService.WEIGHTS.MAX_DISTANCE_POINTS - distanceKm * RankingService.WEIGHTS.DISTANCE_PENALTY_PER_KM
    );

    // 2. Request Urgency Component (Max 30 pts)
    const urgencyPoints = RankingService.WEIGHTS.URGENCY_POINTS[urgency] || 10;

    // 3. Verification & Donation History Component (Max 20 pts)
    let verificationPoints = 0;
    if (verificationStatus === VerificationStatus.VERIFIED) {
      verificationPoints += RankingService.WEIGHTS.VERIFICATION_POINTS;
    }

    if (!lastDonationDate) {
      verificationPoints += RankingService.WEIGHTS.DONATION_RECENCY_BONUS;
    } else {
      const daysElapsed = (new Date().getTime() - new Date(lastDonationDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysElapsed >= 180) {
        verificationPoints += RankingService.WEIGHTS.DONATION_RECENCY_BONUS;
      }
    }

    const totalRawScore = distancePoints + urgencyPoints + verificationPoints;
    return Math.min(100, Math.max(0, Math.round(totalRawScore)));
  }

  /**
   * Deterministically sorts candidate matches by Match Priority Score (descending),
   * distanceKm (ascending), and donorId string (ascending).
   */
  static rankCandidates<T>(
    items: Array<{ candidate: T; donorId?: string; distanceKm: number; matchScore: number }>
  ): Array<{ candidate: T; donorId?: string; distanceKm: number; matchScore: number }> {
    return [...items].sort((a, b) => {
      // 1. Primary sort: Match Score (descending)
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // 2. Secondary sort: Distance in Km (ascending)
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      // 3. Tertiary sort: Donor ID string (alphabetical ascending for stable sorting)
      const idA = a.donorId || (a.candidate as any)?.donorId || (a.candidate as any)?.id || '';
      const idB = b.donorId || (b.candidate as any)?.donorId || (b.candidate as any)?.id || '';
      return idA.localeCompare(idB);
    });
  }
}
