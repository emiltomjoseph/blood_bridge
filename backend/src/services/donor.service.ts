import { prisma } from '../config/prisma';
import { BloodGroup, AvailabilityStatus, VerificationStatus } from '@prisma/client';

export interface CreateDonorDto {
  userId: string;
  bloodGroup: BloodGroup;
  dateOfBirth?: Date;
  lastDonationDate?: Date;
  latitude: number;
  longitude: number;
  availabilityStatus?: AvailabilityStatus;
  name?: string;
  phone?: string;
}

export interface UpdateDonorDto {
  bloodGroup?: BloodGroup;
  dateOfBirth?: Date;
  lastDonationDate?: Date;
  latitude?: number;
  longitude?: number;
  availabilityStatus?: AvailabilityStatus;
  name?: string;
  phone?: string;
}

export class DonorService {
  static async createProfile(dto: CreateDonorDto) {
    const existingDonor = await prisma.donor.findUnique({
      where: { userId: dto.userId },
    });

    if (existingDonor) {
      throw new Error('DONOR_PROFILE_EXISTS');
    }

    if (dto.name || dto.phone) {
      await prisma.user.update({
        where: { id: dto.userId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.phone && { phone: dto.phone }),
        },
      });
    }

    return prisma.donor.create({
      data: {
        userId: dto.userId,
        bloodGroup: dto.bloodGroup,
        dateOfBirth: dto.dateOfBirth,
        lastDonationDate: dto.lastDonationDate,
        latitude: dto.latitude,
        longitude: dto.longitude,
        availabilityStatus: dto.availabilityStatus ?? AvailabilityStatus.AVAILABLE,
        verificationStatus: VerificationStatus.PENDING,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
    });
  }

  static async getProfileByUserId(userId: string) {
    return prisma.donor.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true, role: true },
        },
      },
    });
  }

  static async getProfileById(id: string) {
    return prisma.donor.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
    });
  }

  static async updateProfile(userId: string, dto: UpdateDonorDto) {
    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      throw new Error('DONOR_NOT_FOUND');
    }

    if (dto.name || dto.phone) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.phone && { phone: dto.phone }),
        },
      });
    }

    return prisma.donor.update({
      where: { userId },
      data: {
        ...(dto.bloodGroup && { bloodGroup: dto.bloodGroup }),
        ...(dto.dateOfBirth !== undefined && { dateOfBirth: dto.dateOfBirth }),
        ...(dto.lastDonationDate !== undefined && { lastDonationDate: dto.lastDonationDate }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.availabilityStatus && { availabilityStatus: dto.availabilityStatus }),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
    });
  }

  static async updateAvailability(userId: string, availabilityStatus: AvailabilityStatus) {
    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      throw new Error('DONOR_NOT_FOUND');
    }

    return prisma.donor.update({
      where: { userId },
      data: { availabilityStatus },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
    });
  }
}
