import { prisma } from '../../config/prisma';
import { RequestStatus, MatchStatus, AvailabilityStatus, VerificationStatus } from '@prisma/client';
import { CompatibilityService } from './compatibility.service';
import { EligibilityService } from './eligibility.service';
import { DistanceService } from './distance.service';
import { RankingService } from './ranking.service';

export class MatchingService {
  /**
   * Executes the complete matching engine pipeline for a given blood request,
   * generates ranked match records, and persists them atomically in a transaction.
   */
  static async findAndCreateMatches(requestId: string, initiatingHospitalId: string, isAdmin = false) {
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: { hospital: true },
    });

    if (!bloodRequest) {
      throw new Error('REQUEST_NOT_FOUND');
    }

    if (!isAdmin && bloodRequest.hospitalId !== initiatingHospitalId) {
      throw new Error('FORBIDDEN_OWNERSHIP');
    }

    if (
      bloodRequest.status === RequestStatus.FULFILLED ||
      bloodRequest.status === RequestStatus.CANCELLED ||
      bloodRequest.status === RequestStatus.EXPIRED
    ) {
      throw new Error('INVALID_REQUEST_STATE_FOR_MATCHING');
    }

    // 1. Database-level pre-filtering
    const compatibleGroups = CompatibilityService.getCompatibleDonorBloodGroups(bloodRequest.bloodGroup);

    const candidateDonors = await prisma.donor.findMany({
      where: {
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        verificationStatus: VerificationStatus.VERIFIED,
        bloodGroup: { in: compatibleGroups },
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    // 2. In-memory eligibility & distance processing
    const processedCandidates: Array<{
      candidate: typeof candidateDonors[0];
      donorId: string;
      distanceKm: number;
      matchScore: number;
    }> = [];

    for (const donor of candidateDonors) {
      // Eligibility check
      if (!EligibilityService.isEligible(donor)) {
        continue;
      }

      // Distance calculation
      const distanceKm = DistanceService.calculateDistanceKm(
        donor.latitude,
        donor.longitude,
        bloodRequest.latitude,
        bloodRequest.longitude
      );

      // Priority Match Score calculation
      const matchScore = RankingService.calculateMatchScore({
        donorId: donor.id,
        distanceKm,
        urgency: bloodRequest.urgency,
        verificationStatus: donor.verificationStatus,
        lastDonationDate: donor.lastDonationDate,
      });

      processedCandidates.push({
        candidate: donor,
        donorId: donor.id,
        distanceKm,
        matchScore,
      });
    }

    // 3. Deterministic Priority Ranking
    const rankedCandidates = RankingService.rankCandidates(processedCandidates);

    // 4. Atomic Database Transaction: Update request state & create match records
    const createdMatches = await prisma.$transaction(async (tx) => {
      if (bloodRequest.status === RequestStatus.OPEN) {
        await tx.bloodRequest.update({
          where: { id: requestId },
          data: { status: RequestStatus.MATCHING },
        });
      }

      const matchPromises = rankedCandidates.map((item) =>
        tx.match.upsert({
          where: {
            requestId_donorId: {
              requestId: bloodRequest.id,
              donorId: item.candidate.id,
            },
          },
          update: {
            distanceKm: item.distanceKm,
            matchScore: item.matchScore,
          },
          create: {
            requestId: bloodRequest.id,
            donorId: item.candidate.id,
            distanceKm: item.distanceKm,
            matchScore: item.matchScore,
            status: MatchStatus.PENDING,
            notifiedAt: new Date(),
          },
          include: {
            donor: {
              select: {
                id: true,
                bloodGroup: true,
                availabilityStatus: true,
                verificationStatus: true,
                user: { select: { id: true, name: true } },
              },
            },
          },
        })
      );

      return Promise.all(matchPromises);
    });

    return createdMatches;
  }

  /**
   * Retrieves ranked matches for a blood request with privacy masking.
   */
  static async getMatchesForRequest(requestId: string, requestingHospitalId: string, isAdmin = false) {
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
    });

    if (!bloodRequest) {
      throw new Error('REQUEST_NOT_FOUND');
    }

    if (!isAdmin && bloodRequest.hospitalId !== requestingHospitalId) {
      throw new Error('FORBIDDEN_OWNERSHIP');
    }

    const matches = await prisma.match.findMany({
      where: { requestId },
      orderBy: [{ matchScore: 'desc' }, { distanceKm: 'asc' }],
      include: {
        donor: {
          select: {
            id: true,
            bloodGroup: true,
            availabilityStatus: true,
            verificationStatus: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return matches;
  }

  /**
   * Donor accepts a pending match request.
   */
  static async acceptMatch(matchId: string, donorUserId: string, isAdmin = false) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        donor: true,
        request: true,
      },
    });

    if (!match) {
      throw new Error('MATCH_NOT_FOUND');
    }

    if (!isAdmin && match.donor.userId !== donorUserId) {
      throw new Error('FORBIDDEN_MATCH_OWNERSHIP');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new Error(`INVALID_MATCH_STATUS:${match.status}`);
    }

    if (
      match.request.status === RequestStatus.CANCELLED ||
      match.request.status === RequestStatus.EXPIRED ||
      match.request.status === RequestStatus.FULFILLED
    ) {
      throw new Error('REQUEST_INACTIVE');
    }

    return prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.ACCEPTED,
        respondedAt: new Date(),
      },
      include: {
        request: {
          select: { id: true, bloodGroup: true, unitsRequired: true, status: true },
        },
        donor: {
          select: { id: true, bloodGroup: true },
        },
      },
    });
  }

  /**
   * Donor rejects a pending match request.
   */
  static async rejectMatch(matchId: string, donorUserId: string, isAdmin = false) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { donor: true },
    });

    if (!match) {
      throw new Error('MATCH_NOT_FOUND');
    }

    if (!isAdmin && match.donor.userId !== donorUserId) {
      throw new Error('FORBIDDEN_MATCH_OWNERSHIP');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new Error(`INVALID_MATCH_STATUS:${match.status}`);
    }

    return prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.REJECTED,
        respondedAt: new Date(),
      },
    });
  }
}
