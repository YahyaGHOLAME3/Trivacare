import * as argon2 from 'argon2';
import {
  AppointmentStatus,
  CareRequestStatus,
  PrismaClient,
  Role,
} from '@prisma/client';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'Trivacare123!';

async function upsertUser(data: {
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      passwordHash,
      isActive: true,
    },
    create: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
      passwordHash,
      isActive: true,
    },
  });
}

async function main() {
  const patientUser = await upsertUser({
    email: 'patient@trivacare.dev',
    role: Role.PATIENT,
    firstName: 'Leila',
    lastName: 'Benali',
    phone: '+212600000001',
  });

  const clinicAdminUser = await upsertUser({
    email: 'clinic.admin@trivacare.dev',
    role: Role.CLINIC_ADMIN,
    firstName: 'Sara',
    lastName: 'Alaoui',
    phone: '+212600000002',
  });

  const professionalUser = await upsertUser({
    email: 'professional@trivacare.dev',
    role: Role.PROFESSIONAL,
    firstName: 'Youssef',
    lastName: 'Mansouri',
    phone: '+212600000003',
  });

  const superAdminUser = await upsertUser({
    email: 'super.admin@trivacare.dev',
    role: Role.SUPER_ADMIN,
    firstName: 'Amine',
    lastName: 'Idrissi',
    phone: '+212600000004',
  });

  const clinic = await prisma.clinic.upsert({
    where: { slug: 'trivacare-casablanca' },
    update: {
      name: 'Trivacare Casablanca',
      email: 'clinic@trivacare.dev',
      phone: '+212522000000',
      address: 'Boulevard Zerktouni, Casablanca',
    },
    create: {
      slug: 'trivacare-casablanca',
      name: 'Trivacare Casablanca',
      email: 'clinic@trivacare.dev',
      phone: '+212522000000',
      address: 'Boulevard Zerktouni, Casablanca',
    },
  });

  const patientProfile = await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {
      address: 'Casablanca',
      gender: 'female',
      emergencyContactName: 'Nadia Benali',
      emergencyContactPhone: '+212611111111',
      dateOfBirth: new Date('1990-04-12'),
    },
    create: {
      userId: patientUser.id,
      address: 'Casablanca',
      gender: 'female',
      emergencyContactName: 'Nadia Benali',
      emergencyContactPhone: '+212611111111',
      dateOfBirth: new Date('1990-04-12'),
    },
  });

  const professionalProfile = await prisma.professionalProfile.upsert({
    where: { userId: professionalUser.id },
    update: {
      specialty: 'General Practice',
      licenseNumber: 'MA-GP-2026-001',
      bio: 'Primary care professional for Trivacare demos.',
    },
    create: {
      userId: professionalUser.id,
      specialty: 'General Practice',
      licenseNumber: 'MA-GP-2026-001',
      bio: 'Primary care professional for Trivacare demos.',
    },
  });

  await prisma.clinicMember.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId: clinicAdminUser.id,
      },
    },
    update: { role: Role.CLINIC_ADMIN },
    create: {
      clinicId: clinic.id,
      userId: clinicAdminUser.id,
      role: Role.CLINIC_ADMIN,
    },
  });

  await prisma.clinicMember.upsert({
    where: {
      clinicId_userId: {
        clinicId: clinic.id,
        userId: professionalUser.id,
      },
    },
    update: { role: Role.PROFESSIONAL },
    create: {
      clinicId: clinic.id,
      userId: professionalUser.id,
      role: Role.PROFESSIONAL,
    },
  });

  const careRequest = await prisma.careRequest.upsert({
    where: { id: '3f6f2d79-88b8-4ff7-9344-9d3357c7f1a1' },
    update: {
      patientId: patientProfile.id,
      clinicId: clinic.id,
      professionalId: professionalProfile.id,
      title: 'Post-discharge follow-up',
      description: 'Patient needs follow-up coordination after hospital discharge.',
      preferredDate: new Date('2026-07-02T09:00:00.000Z'),
      status: CareRequestStatus.UNDER_REVIEW,
    },
    create: {
      id: '3f6f2d79-88b8-4ff7-9344-9d3357c7f1a1',
      patientId: patientProfile.id,
      clinicId: clinic.id,
      professionalId: professionalProfile.id,
      title: 'Post-discharge follow-up',
      description: 'Patient needs follow-up coordination after hospital discharge.',
      preferredDate: new Date('2026-07-02T09:00:00.000Z'),
      status: CareRequestStatus.UNDER_REVIEW,
    },
  });

  const appointment = await prisma.appointment.upsert({
    where: { id: '25f9963e-4c2f-4ad3-a6c2-d8a84e74db80' },
    update: {
      patientId: patientProfile.id,
      clinicId: clinic.id,
      professionalId: professionalProfile.id,
      careRequestId: careRequest.id,
      createdById: clinicAdminUser.id,
      scheduledAt: new Date('2026-07-03T10:00:00.000Z'),
      endAt: new Date('2026-07-03T10:30:00.000Z'),
      location: 'Trivacare Casablanca',
      notes: 'Initial follow-up consultation',
      status: AppointmentStatus.CONFIRMED,
    },
    create: {
      id: '25f9963e-4c2f-4ad3-a6c2-d8a84e74db80',
      patientId: patientProfile.id,
      clinicId: clinic.id,
      professionalId: professionalProfile.id,
      careRequestId: careRequest.id,
      createdById: clinicAdminUser.id,
      scheduledAt: new Date('2026-07-03T10:00:00.000Z'),
      endAt: new Date('2026-07-03T10:30:00.000Z'),
      location: 'Trivacare Casablanca',
      notes: 'Initial follow-up consultation',
      status: AppointmentStatus.CONFIRMED,
    },
  });

  await prisma.medicalDocument.upsert({
    where: { id: 'e572c12f-79a6-4e6a-8394-b4fba4fd4af0' },
    update: {
      patientId: patientProfile.id,
      careRequestId: careRequest.id,
      uploadedById: clinicAdminUser.id,
      fileName: 'discharge-summary.pdf',
      mimeType: 'application/pdf',
      fileSize: 245760,
      storageKey: 'documents/discharge/discharge-summary.pdf',
      documentType: 'DISCHARGE_SUMMARY',
    },
    create: {
      id: 'e572c12f-79a6-4e6a-8394-b4fba4fd4af0',
      patientId: patientProfile.id,
      careRequestId: careRequest.id,
      uploadedById: clinicAdminUser.id,
      fileName: 'discharge-summary.pdf',
      mimeType: 'application/pdf',
      fileSize: 245760,
      storageKey: 'documents/discharge/discharge-summary.pdf',
      documentType: 'DISCHARGE_SUMMARY',
    },
  });

  await prisma.clinicalNote.upsert({
    where: { id: '0fb710fd-6c81-4fb1-9471-fd89dfeee70f' },
    update: {
      patientId: patientProfile.id,
      professionalId: professionalProfile.id,
      careRequestId: careRequest.id,
      appointmentId: appointment.id,
      content: 'Patient is stable. Recommend weekly follow-up for the next month.',
    },
    create: {
      id: '0fb710fd-6c81-4fb1-9471-fd89dfeee70f',
      patientId: patientProfile.id,
      professionalId: professionalProfile.id,
      careRequestId: careRequest.id,
      appointmentId: appointment.id,
      content: 'Patient is stable. Recommend weekly follow-up for the next month.',
    },
  });

  await prisma.auditLog.upsert({
    where: { id: 'f6260b20-48af-4695-a700-6eb76d20c074' },
    update: {
      actorId: superAdminUser.id,
      action: 'seed',
      entityType: 'System',
      entityId: 'initial-seed',
      metadata: {
        users: [
          patientUser.email,
          clinicAdminUser.email,
          professionalUser.email,
          superAdminUser.email,
        ],
        clinicId: clinic.id,
      },
    },
    create: {
      id: 'f6260b20-48af-4695-a700-6eb76d20c074',
      actorId: superAdminUser.id,
      action: 'seed',
      entityType: 'System',
      entityId: 'initial-seed',
      metadata: {
        users: [
          patientUser.email,
          clinicAdminUser.email,
          professionalUser.email,
          superAdminUser.email,
        ],
        clinicId: clinic.id,
      },
    },
  });

  console.log('Seed completed.');
  console.log(`Seed password for all demo users: ${SEED_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
