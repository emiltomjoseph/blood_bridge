import { prisma } from '../config/prisma';
import { BloodGroup, UrgencyLevel, RequestStatus } from '@prisma/client';

export interface CreateBloodRequestDto {
  hospitalId: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency?: UrgencyLevel;
  latitude: number;
  longitude: number;
  requiredBy: Date;
  notes?: string;
}

export interface UpdateBloodRequestDto {
  bloodGroup?: BloodGroup;
  unitsRequired?: number;
  urgency?: UrgencyLevel;
  latitude?: number;
  longitude?: number;
  requiredBy?: Date;
  notes?: string;
}

export interface QueryBloodRequestsDto {
  bloodGroup?: BloodGroup;
  urgency?: UrgencyLevel;
  status?: RequestStatus;
  district?: string;
  page?: number;
  limit?: number;
}

const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  OPEN: [RequestStatus.MATCHING, RequestStatus.CANCELLED],
  MATCHING: [
    RequestStatus.PARTIALLY_FULFILLED,
    RequestStatus.FULFILLED,
    RequestStatus.CANCELLED,
    RequestStatus.EXPIRED,
  ],
  PARTIALLY_FULFILLED: [RequestStatus.FULFILLED, RequestStatus.CANCELLED],
  FULFILLED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export class RequestService {
  static async createRequest(dto: CreateBloodRequestDto) {
    const hospital = await prisma.hospital.findUnique({
      where: { id: dto.hospitalId },
    });

    if (!hospital) {
      throw new Error('HOSPITAL_NOT_FOUND');
    }

    return prisma.bloodRequest.create({
      data: {
        hospitalId: dto.hospitalId,
        bloodGroup: dto.bloodGroup,
        unitsRequired: dto.unitsRequired,
        urgency: dto.urgency ?? UrgencyLevel.URGENT,
        latitude: dto.latitude,
        longitude: dto.longitude,
        requiredBy: dto.requiredBy,
        status: RequestStatus.OPEN,
        notes: dto.notes,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            district: true,
            address: true,
            latitude: true,
            longitude: true,
            user: { select: { phone: true } },
          },
        },
      },
    });
  }

  static async getRequests(query: QueryBloodRequestsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.bloodGroup) where.bloodGroup = query.bloodGroup;
    if (query.urgency) where.urgency = query.urgency;
    if (query.status) where.status = query.status;
    if (query.district) {
      where.hospital = {
        district: {
          contains: query.district,
          mode: 'insensitive',
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
              district: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      }),
      prisma.bloodRequest.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getRequestById(id: string) {
    return prisma.bloodRequest.findUnique({
      where: { id },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            district: true,
            address: true,
            latitude: true,
            longitude: true,
            user: { select: { phone: true, email: true } },
          },
        },
        matches: {
          select: {
            id: true,
            donorId: true,
            status: true,
            distanceKm: true,
            matchScore: true,
            createdAt: true,
          },
        },
      },
    });
  }

  static async updateRequest(id: string, hospitalId: string, dto: UpdateBloodRequestDto, isAdmin = false) {
    const request = await prisma.bloodRequest.findUnique({ where: { id } });

    if (!request) {
      throw new Error('REQUEST_NOT_FOUND');
    }

    if (!isAdmin && request.hospitalId !== hospitalId) {
      throw new Error('FORBIDDEN_OWNERSHIP');
    }

    if (request.status === RequestStatus.FULFILLED || request.status === RequestStatus.CANCELLED) {
      throw new Error('TERMINAL_STATE_CANNOT_EDIT');
    }

    return prisma.bloodRequest.update({
      where: { id },
      data: {
        ...(dto.bloodGroup && { bloodGroup: dto.bloodGroup }),
        ...(dto.unitsRequired && { unitsRequired: dto.unitsRequired }),
        ...(dto.urgency && { urgency: dto.urgency }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.requiredBy && { requiredBy: dto.requiredBy }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        hospital: {
          select: { id: true, name: true, district: true },
        },
      },
    });
  }

  static async transitionStatus(id: string, hospitalId: string, targetStatus: RequestStatus, isAdmin = false) {
    const request = await prisma.bloodRequest.findUnique({ where: { id } });

    if (!request) {
      throw new Error('REQUEST_NOT_FOUND');
    }

    if (!isAdmin && request.hospitalId !== hospitalId) {
      throw new Error('FORBIDDEN_OWNERSHIP');
    }

    const currentStatus = request.status;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(targetStatus)) {
      throw new Error(`INVALID_STATUS_TRANSITION:${currentStatus}->${targetStatus}`);
    }

    return prisma.bloodRequest.update({
      where: { id },
      data: { status: targetStatus },
      include: {
        hospital: {
          select: { id: true, name: true, district: true },
        },
      },
    });
  }

  static async deleteRequest(id: string, hospitalId: string, isAdmin = false) {
    const request = await prisma.bloodRequest.findUnique({ where: { id } });

    if (!request) {
      throw new Error('REQUEST_NOT_FOUND');
    }

    if (!isAdmin && request.hospitalId !== hospitalId) {
      throw new Error('FORBIDDEN_OWNERSHIP');
    }

    return this.transitionStatus(id, hospitalId, RequestStatus.CANCELLED, isAdmin);
  }
}
