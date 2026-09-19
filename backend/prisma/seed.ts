import { PrismaClient, UserRole, BloodGroup, AvailabilityStatus, VerificationStatus, UrgencyLevel, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BloodBridge database seed...');

  // Seed Users
  const hospitalUser = await prisma.user.upsert({
    where: { id: 'seed-hosp-user-1' },
    update: {},
    create: {
      id: 'seed-hosp-user-1',
      email: 'ernakulam.general@hospital.org',
      name: 'Ernakulam General Hospital',
      phone: '+919847012345',
      role: UserRole.HOSPITAL,
    },
  });

  const donorUser1 = await prisma.user.upsert({
    where: { id: 'seed-donor-user-1' },
    update: {},
    create: {
      id: 'seed-donor-user-1',
      email: 'rahul.sharma@donor.org',
      name: 'Rahul Sharma',
      phone: '+919895111111',
      role: UserRole.DONOR,
    },
  });

  const donorUser2 = await prisma.user.upsert({
    where: { id: 'seed-donor-user-2' },
    update: {},
    create: {
      id: 'seed-donor-user-2',
      email: 'ananya.nair@donor.org',
      name: 'Ananya Nair',
      phone: '+919895222222',
      role: UserRole.DONOR,
    },
  });

  const donorUser3 = await prisma.user.upsert({
    where: { id: 'seed-donor-user-3' },
    update: {},
    create: {
      id: 'seed-donor-user-3',
      email: 'vikram.joseph@donor.org',
      name: 'Vikram Joseph',
      phone: '+919895333333',
      role: UserRole.DONOR,
    },
  });

  // Seed Hospital Profile (Lat: 9.9816, Lon: 76.2999)
  const hospital = await prisma.hospital.upsert({
    where: { userId: hospitalUser.id },
    update: {},
    create: {
      userId: hospitalUser.id,
      name: 'Ernakulam General Hospital',
      address: 'Hospital Road, Marine Drive, Kochi',
      district: 'Ernakulam',
      latitude: 9.9816,
      longitude: 76.2999,
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  // Seed Donor Profiles around Ernakulam / Kochi
  // Donor 1: O_POS, Verified, Available, ~2.2 km away
  await prisma.donor.upsert({
    where: { userId: donorUser1.id },
    update: {},
    create: {
      userId: donorUser1.id,
      bloodGroup: BloodGroup.O_POS,
      dateOfBirth: new Date('1996-04-12'),
      lastDonationDate: new Date('2024-01-15'),
      latitude: 9.9650,
      longitude: 76.2900,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  // Donor 2: O_NEG, Verified, Available (Universal Donor), ~4.8 km away
  await prisma.donor.upsert({
    where: { userId: donorUser2.id },
    update: {},
    create: {
      userId: donorUser2.id,
      bloodGroup: BloodGroup.O_NEG,
      dateOfBirth: new Date('1998-08-25'),
      lastDonationDate: new Date('2023-11-20'),
      latitude: 9.9500,
      longitude: 76.3200,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  // Donor 3: A_POS, Verified, Available, ~1.5 km away
  await prisma.donor.upsert({
    where: { userId: donorUser3.id },
    update: {},
    create: {
      userId: donorUser3.id,
      bloodGroup: BloodGroup.A_POS,
      dateOfBirth: new Date('1994-11-03'),
      lastDonationDate: null,
      latitude: 9.9750,
      longitude: 76.2920,
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      verificationStatus: VerificationStatus.VERIFIED,
    },
  });

  // Seed Emergency Blood Request
  const bloodRequest = await prisma.bloodRequest.create({
    data: {
      hospitalId: hospital.id,
      bloodGroup: BloodGroup.O_POS,
      unitsRequired: 3,
      urgency: UrgencyLevel.CRITICAL,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      requiredBy: new Date(Date.now() + 48 * 3600 * 1000),
      status: RequestStatus.OPEN,
      notes: 'Emergency O+ required for trauma surgery',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Created Hospital: ${hospital.name}`);
  console.log(`Created Emergency Blood Request ID: ${bloodRequest.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
