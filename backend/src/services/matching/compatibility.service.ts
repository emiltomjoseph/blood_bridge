import { BloodGroup } from '@prisma/client';

/**
 * Deterministic Red Blood Cell ABO/Rh Compatibility Engine
 * 
 * Matrix maps Donor Blood Group -> Array of compatible Recipient Blood Groups.
 */
const COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  O_NEG: [
    BloodGroup.O_NEG,
    BloodGroup.O_POS,
    BloodGroup.A_NEG,
    BloodGroup.A_POS,
    BloodGroup.B_NEG,
    BloodGroup.B_POS,
    BloodGroup.AB_NEG,
    BloodGroup.AB_POS,
  ],
  O_POS: [
    BloodGroup.O_POS,
    BloodGroup.A_POS,
    BloodGroup.B_POS,
    BloodGroup.AB_POS,
  ],
  A_NEG: [
    BloodGroup.A_NEG,
    BloodGroup.A_POS,
    BloodGroup.AB_NEG,
    BloodGroup.AB_POS,
  ],
  A_POS: [
    BloodGroup.A_POS,
    BloodGroup.AB_POS,
  ],
  B_NEG: [
    BloodGroup.B_NEG,
    BloodGroup.B_POS,
    BloodGroup.AB_NEG,
    BloodGroup.AB_POS,
  ],
  B_POS: [
    BloodGroup.B_POS,
    BloodGroup.AB_POS,
  ],
  AB_NEG: [
    BloodGroup.AB_NEG,
    BloodGroup.AB_POS,
  ],
  AB_POS: [
    BloodGroup.AB_POS,
  ],
};

/**
 * Inverted matrix: Recipient Blood Group -> Array of compatible Donor Blood Groups.
 */
const RECIPIENT_DONOR_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  O_NEG: [BloodGroup.O_NEG],
  O_POS: [BloodGroup.O_NEG, BloodGroup.O_POS],
  A_NEG: [BloodGroup.O_NEG, BloodGroup.A_NEG],
  A_POS: [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.A_NEG, BloodGroup.A_POS],
  B_NEG: [BloodGroup.O_NEG, BloodGroup.B_NEG],
  B_POS: [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.B_NEG, BloodGroup.B_POS],
  AB_NEG: [BloodGroup.O_NEG, BloodGroup.A_NEG, BloodGroup.B_NEG, BloodGroup.AB_NEG],
  AB_POS: [
    BloodGroup.O_NEG,
    BloodGroup.O_POS,
    BloodGroup.A_NEG,
    BloodGroup.A_POS,
    BloodGroup.B_NEG,
    BloodGroup.B_POS,
    BloodGroup.AB_NEG,
    BloodGroup.AB_POS,
  ],
};

export class CompatibilityService {
  /**
   * Deterministically checks if a donor blood group is red-cell compatible with recipient blood group.
   */
  static isCompatible(donorBloodGroup: BloodGroup, recipientBloodGroup: BloodGroup): boolean {
    const compatibleRecipients = COMPATIBILITY_MATRIX[donorBloodGroup];
    return compatibleRecipients ? compatibleRecipients.includes(recipientBloodGroup) : false;
  }

  /**
   * Returns list of compatible donor blood groups for a given recipient blood group.
   * Useful for database-level pre-filtering.
   */
  static getCompatibleDonorBloodGroups(recipientBloodGroup: BloodGroup): BloodGroup[] {
    return RECIPIENT_DONOR_MATRIX[recipientBloodGroup] || [];
  }
}
