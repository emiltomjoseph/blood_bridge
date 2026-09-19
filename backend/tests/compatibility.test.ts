import { describe, it, expect } from 'vitest';
import { CompatibilityService } from '../src/services/matching/compatibility.service';
import { BloodGroup } from '@prisma/client';

describe('Blood Compatibility Engine Tests (All 64 Combinations)', () => {
  const allGroups = Object.values(BloodGroup);

  it('O_NEG should be universal donor (compatible with all 8 blood groups)', () => {
    for (const recipient of allGroups) {
      expect(CompatibilityService.isCompatible(BloodGroup.O_NEG, recipient)).toBe(true);
    }
  });

  it('AB_POS should be universal recipient (can receive from all 8 blood groups)', () => {
    for (const donor of allGroups) {
      expect(CompatibilityService.isCompatible(donor, BloodGroup.AB_POS)).toBe(true);
    }
  });

  it('AB_POS donor should donate ONLY to AB_POS recipient', () => {
    for (const recipient of allGroups) {
      if (recipient === BloodGroup.AB_POS) {
        expect(CompatibilityService.isCompatible(BloodGroup.AB_POS, recipient)).toBe(true);
      } else {
        expect(CompatibilityService.isCompatible(BloodGroup.AB_POS, recipient)).toBe(false);
      }
    }
  });

  it('O_POS donor should donate to positive blood groups ONLY (O+, A+, B+, AB+)', () => {
    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.O_POS)).toBe(true);
    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.A_POS)).toBe(true);
    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.B_POS)).toBe(true);
    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.AB_POS)).toBe(true);

    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.O_NEG)).toBe(false);
    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.A_NEG)).toBe(false);
    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.B_NEG)).toBe(false);
    expect(CompatibilityService.isCompatible(BloodGroup.O_POS, BloodGroup.AB_NEG)).toBe(false);
  });

  it('A_POS donor should donate ONLY to A+ and AB+', () => {
    expect(CompatibilityService.isCompatible(BloodGroup.A_POS, BloodGroup.A_POS)).toBe(true);
    expect(CompatibilityService.isCompatible(BloodGroup.A_POS, BloodGroup.AB_POS)).toBe(true);

    expect(CompatibilityService.isCompatible(BloodGroup.A_POS, BloodGroup.B_POS)).toBe(false);
    expect(CompatibilityService.isCompatible(BloodGroup.A_POS, BloodGroup.O_POS)).toBe(false);
  });

  it('getCompatibleDonorBloodGroups should return accurate candidates for A_POS recipient', () => {
    const candidates = CompatibilityService.getCompatibleDonorBloodGroups(BloodGroup.A_POS);
    expect(candidates).toEqual([
      BloodGroup.O_NEG,
      BloodGroup.O_POS,
      BloodGroup.A_NEG,
      BloodGroup.A_POS,
    ]);
  });
});
