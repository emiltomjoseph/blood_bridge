import { prisma } from '../config/prisma';
import { VerificationStatus } from '@prisma/client';

export interface CreateHospitalDto {
  userId: string;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string;
}

export interface UpdateHospitalDto {
  name?: string;
  address?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

export class HospitalService {
  static async createProfile(dto: CreateHospitalDto) {
    const existingHospital = await prisma.hospital.findUnique({
      where: { userId: dto.userId },
    });

    if (existingHospital) {
      throw new Error('HOSPITAL_PROFILE_EXISTS');
    }

    if (dto.phone) {
      await prisma.user.update({
        where: { id: dto.userId },
        data: { phone: dto.phone },
      });
    }

    return prisma.hospital.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        address: dto.address,
        district: dto.district,
        latitude: dto.latitude,
        longitude: dto.longitude,
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
    return prisma.hospital.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true, role: true },
        },
      },
    });
  }

  static async getProfileById(id: string) {
    return prisma.hospital.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
    });
  }

  static async updateProfile(userId: string, dto: UpdateHospitalDto) {
    const hospital = await prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) {
      throw new Error('HOSPITAL_NOT_FOUND');
    }

    if (dto.phone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: dto.phone },
      });
    }

    return prisma.hospital.update({
      where: { userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.address && { address: dto.address }),
        ...(dto.district && { district: dto.district }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
    });
  }
}
