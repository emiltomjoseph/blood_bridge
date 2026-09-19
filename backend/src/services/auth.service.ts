import { prisma } from '../config/prisma';
import { UserRole } from '@prisma/client';

export class AuthService {
  static async syncUser(id: string, email: string, name: string, role: UserRole, phone?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { donor: true, hospital: true },
    });

    if (existingUser) {
      const updated = await prisma.user.update({
        where: { id },
        data: { name, phone: phone ?? existingUser.phone, role },
        include: { donor: true, hospital: true },
      });
      return updated;
    }

    const newUser = await prisma.user.create({
      data: {
        id,
        email,
        name,
        phone,
        role,
      },
      include: { donor: true, hospital: true },
    });

    return newUser;
  }

  static async getUserProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { donor: true, hospital: true },
    });
  }
}
