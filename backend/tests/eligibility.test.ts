import { describe, it, expect } from 'vitest';
import { EligibilityService } from '../src/services/matching/eligibility.service';
import { AvailabilityStatus, VerificationStatus } from '@prisma/client';

describe('Donor Eligibility Service Tests', () => {
  it('should return true for VERIFIED and AVAILABLE donor with no previous donation record', () => {
    const isEligible = EligibilityService.isEligible({
      verificationStatus: VerificationStatus.VERIFIED,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      lastDonationDate: null,
    });
    expect(isEligible).toBe(true);
  });

  it('should return false for PENDING or REJECTED verification status', () => {
    expect(
      EligibilityService.isEligible({
        verificationStatus: VerificationStatus.PENDING,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      })
    ).toBe(false);

    expect(
      EligibilityService.isEligible({
        verificationStatus: VerificationStatus.REJECTED,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      })
    ).toBe(false);
  });

  it('should return false for UNAVAILABLE or PAUSED availability status', () => {
    expect(
      EligibilityService.isEligible({
        verificationStatus: VerificationStatus.VERIFIED,
        availabilityStatus: AvailabilityStatus.UNAVAILABLE,
      })
    ).toBe(false);

    expect(
      EligibilityService.isEligible({
        verificationStatus: VerificationStatus.VERIFIED,
        availabilityStatus: AvailabilityStatus.PAUSED,
      })
    ).toBe(false);
  });

  it('should return false if last donation date is within minimum interval (e.g. < 56 days)', () => {
    const recentDonation = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
    const isEligible = EligibilityService.isEligible({
      verificationStatus: VerificationStatus.VERIFIED,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      lastDonationDate: recentDonation,
    });
    expect(isEligible).toBe(false);
  });

  it('should return true if last donation date is past minimum interval (e.g. >= 56 days)', () => {
    const oldDonation = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    const isEligible = EligibilityService.isEligible({
      verificationStatus: VerificationStatus.VERIFIED,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      lastDonationDate: oldDonation,
    });
    expect(isEligible).toBe(true);
  });
});
