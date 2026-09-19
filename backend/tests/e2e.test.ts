import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';
import { BloodGroup, AvailabilityStatus, VerificationStatus, UrgencyLevel, RequestStatus, UserRole } from '@prisma/client';

describe('Phase 4 End-to-End Integration Scenario & Workflow Tests', () => {
  const testHospitalUserId = 'e2e-hosp-user-101';
  const testDonorUserId1 = 'e2e-donor-user-201'; // Compatible O_POS donor
  const testDonorUserId2 = 'e2e-donor-user-202'; // Incompatible AB_POS donor
  const testDonorUserId3 = 'e2e-donor-user-203'; // Unavailable O_POS donor

  let hospitalId: string;
  let donorId1: string;
  let requestId: string;
  let matchId1: string;

  beforeAll(async () => {
    // Delete all records before e2e test run to ensure a clean, isolated environment
    await prisma.donationRecord.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.bloodRequest.deleteMany({});
    await prisma.donor.deleteMany({});
    await prisma.hospital.deleteMany({});
    await prisma.user.deleteMany({ where: { id: { notIn: ['seed-hosp-user-1', 'seed-donor-user-1', 'seed-donor-user-2', 'seed-donor-user-3'] } } });

    // Seed test users
    await prisma.user.createMany({
      data: [
        { id: testHospitalUserId, email: 'hosp101@test.com', name: 'City Hospital', role: UserRole.HOSPITAL, phone: '+919000000101' },
        { id: testDonorUserId1, email: 'donor201@test.com', name: 'Verified Donor One', role: UserRole.DONOR, phone: '+919000000201' },
        { id: testDonorUserId2, email: 'donor202@test.com', name: 'Incompatible Donor Two', role: UserRole.DONOR, phone: '+919000000202' },
        { id: testDonorUserId3, email: 'donor203@test.com', name: 'Unavailable Donor Three', role: UserRole.DONOR, phone: '+919000000203' },
      ],
    });

    // Create Hospital Profile (Ernakulam, Lat: 9.9816, Lon: 76.2999)
    const hospital = await prisma.hospital.create({
      data: {
        userId: testHospitalUserId,
        name: 'City Emergency Hospital',
        address: 'MG Road, Ernakulam',
        district: 'Ernakulam',
        latitude: 9.9816,
        longitude: 76.2999,
        verificationStatus: VerificationStatus.VERIFIED,
      },
    });
    hospitalId = hospital.id;

    // Create Donor 1: O_POS, VERIFIED, AVAILABLE, 2.5 km away
    const donor1 = await prisma.donor.create({
      data: {
        userId: testDonorUserId1,
        bloodGroup: BloodGroup.O_POS,
        latitude: 9.9600,
        longitude: 76.2900,
        verificationStatus: VerificationStatus.VERIFIED,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      },
    });
    donorId1 = donor1.id;

    // Create Donor 2: AB_POS, VERIFIED, AVAILABLE (Incompatible for A_POS request)
    await prisma.donor.create({
      data: {
        userId: testDonorUserId2,
        bloodGroup: BloodGroup.AB_POS,
        latitude: 9.9700,
        longitude: 76.2950,
        verificationStatus: VerificationStatus.VERIFIED,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
      },
    });

    // Create Donor 3: O_POS, VERIFIED, UNAVAILABLE
    await prisma.donor.create({
      data: {
        userId: testDonorUserId3,
        bloodGroup: BloodGroup.O_POS,
        latitude: 9.9800,
        longitude: 76.2980,
        verificationStatus: VerificationStatus.VERIFIED,
        availabilityStatus: AvailabilityStatus.UNAVAILABLE,
      },
    });
  });

  afterAll(async () => {
    // Cleanup generated e2e test records
    await prisma.donationRecord.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.bloodRequest.deleteMany({});
    await prisma.donor.deleteMany({});
    await prisma.hospital.deleteMany({});
    await prisma.user.deleteMany({ where: { id: { in: [testHospitalUserId, testDonorUserId1, testDonorUserId2, testDonorUserId3] } } });
  });

  it('Step 1: Hospital creates an urgent blood request for A_POS blood', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer mock-token-${testHospitalUserId}`)
      .set('x-mock-role', 'HOSPITAL')
      .send({
        bloodGroup: 'A_POS',
        unitsRequired: 2,
        urgency: 'CRITICAL',
        latitude: 9.9816,
        longitude: 76.2999,
        requiredBy: new Date(Date.now() + 86400000).toISOString(),
        notes: 'Urgent E2E ICU requirement',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(RequestStatus.OPEN);
    expect(res.body.data.hospitalId).toBe(hospitalId);

    requestId = res.body.data.id;
  });

  it('Step 2: Hospital executes matching engine pipeline on the request', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/match`)
      .set('Authorization', `Bearer mock-token-${testHospitalUserId}`)
      .set('x-mock-role', 'HOSPITAL');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMatches).toBeGreaterThanOrEqual(1);

    const matchForDonor1 = res.body.data.matches.find((m: any) => m.donorId === donorId1);
    expect(matchForDonor1).toBeDefined();

    matchId1 = matchForDonor1.id;
  });

  it('Step 3: Hospital retrieves ranked matches for the request', async () => {
    const res = await request(app)
      .get(`/api/requests/${requestId}/matches`)
      .set('Authorization', `Bearer mock-token-${testHospitalUserId}`)
      .set('x-mock-role', 'HOSPITAL');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.matches.length).toBeGreaterThanOrEqual(1);
  });

  it('Step 4: Matched Donor 1 accepts the match request', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId1}/accept`)
      .set('Authorization', `Bearer mock-token-${testDonorUserId1}`)
      .set('x-mock-role', 'DONOR');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACCEPTED');
    expect(res.body.data.respondedAt).toBeDefined();
  });

  it('Step 5: Hospital transitions request state to FULFILLED', async () => {
    const res = await request(app)
      .patch(`/api/requests/${requestId}/status`)
      .set('Authorization', `Bearer mock-token-${testHospitalUserId}`)
      .set('x-mock-role', 'HOSPITAL')
      .send({ status: 'FULFILLED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(RequestStatus.FULFILLED);
  });

  it('Step 6: Handle empty candidate pool scenario cleanly', async () => {
    // Create a request for B_NEG blood where no B_NEG or O_NEG donor is present in test DB
    const createRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer mock-token-${testHospitalUserId}`)
      .set('x-mock-role', 'HOSPITAL')
      .send({
        bloodGroup: 'B_NEG',
        unitsRequired: 1,
        urgency: 'NORMAL',
        latitude: 9.9816,
        longitude: 76.2999,
        requiredBy: new Date(Date.now() + 86400000).toISOString(),
      });

    const rareReqId = createRes.body.data.id;

    const matchRes = await request(app)
      .post(`/api/requests/${rareReqId}/match`)
      .set('Authorization', `Bearer mock-token-${testHospitalUserId}`)
      .set('x-mock-role', 'HOSPITAL');

    expect(matchRes.status).toBe(200);
    expect(matchRes.body.data.totalMatches).toBe(0);
    expect(matchRes.body.data.matches).toEqual([]);

    await prisma.bloodRequest.delete({ where: { id: rareReqId } });
  });

  it('Step 7: Enforce security & privacy controls', async () => {
    const forbiddenRes = await request(app)
      .post(`/api/requests/${requestId}/match`)
      .set('Authorization', `Bearer mock-token-${testDonorUserId1}`)
      .set('x-mock-role', 'DONOR');

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.error.code).toBe('FORBIDDEN');
  });
});
