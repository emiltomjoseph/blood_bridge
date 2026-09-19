import { AvailabilityStatus, VerificationStatus } from '@prisma/client';

export interface DonorEligibilityInput {
  verificationStatus: VerificationStatus;
  availabilityStatus: AvailabilityStatus;
  lastDonationDate?: Date | null;
}

export class EligibilityService {
  /**
   * Minimum donation interval in days (default: 56 days for whole blood donation).
   * Configurable via options parameter to prevent arbitrary medical policy hardcoding.
   */
  static DEFAULT_MIN_DONATION_INTERVAL_DAYS = 56;

  /**
   * Evaluates operational and donation gap eligibility for candidate donor.
   */
  static isEligible(
    donor: DonorEligibilityInput,
    minIntervalDays: number = EligibilityService.DEFAULT_MIN_DONATION_INTERVAL_DAYS
  ): boolean {
    // Rule 1: Verification status must be VERIFIED
    if (donor.verificationStatus !== VerificationStatus.VERIFIED) {
      return false;
    }

    // Rule 2: Availability status must be AVAILABLE
    if (donor.availabilityStatus !== AvailabilityStatus.AVAILABLE) {
      return false;
    }

    // Rule 3: Last donation interval check (if lastDonationDate is recorded)
    if (donor.lastDonationDate) {
      const now = new Date().getTime();
      const lastDonationTime = new Date(donor.lastDonationDate).getTime();
      const daysElapsed = (now - lastDonationTime) / (1000 * 60 * 60 * 24);

      if (daysElapsed < minIntervalDays) {
        return false;
      }
    }

    return true;
  }
}
