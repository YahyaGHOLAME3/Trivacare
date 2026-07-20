import * as argon2 from 'argon2';
import {
  AppointmentStatus,
  CareRequestStatus,
  ConversationAnchorType,
  ConversationParticipantRole,
  InvoiceStatus,
  PaymentIntentStatus,
  PrismaClient,
  QuoteStatus,
  Role,
  TripStatus,
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
      nationality: 'Marocaine',
      insurer: 'Allianz Travel — Police N° TR-99820145',
      bloodType: 'O+',
      medicalSummary: 'Maladie chronique · Diabète type 2',
      primaryCoordinator: 'Dr. Salma Amrani',
      emergencyContactName: 'Nadia Benali',
      emergencyContactPhone: '+212611111111',
      dateOfBirth: new Date('1990-04-12'),
    },
    create: {
      userId: patientUser.id,
      address: 'Casablanca',
      gender: 'female',
      nationality: 'Marocaine',
      insurer: 'Allianz Travel — Police N° TR-99820145',
      bloodType: 'O+',
      medicalSummary: 'Maladie chronique · Diabète type 2',
      primaryCoordinator: 'Dr. Salma Amrani',
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
      scheduledAt: new Date('2026-07-22T10:00:00.000Z'),
      endAt: new Date('2026-07-22T10:30:00.000Z'),
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
      scheduledAt: new Date('2026-07-22T10:00:00.000Z'),
      endAt: new Date('2026-07-22T10:30:00.000Z'),
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

  const trip = await prisma.tripPlan.upsert({
    where: { id: '7e5f7019-8f4f-4564-9a6f-83d0235ef4f5' },
    update: {
      patientId: patientProfile.id,
      title: 'Casablanca follow-up trip',
      destination: 'Casablanca',
      startDate: new Date('2026-07-21T09:00:00.000Z'),
      endDate: new Date('2026-07-23T18:00:00.000Z'),
      status: TripStatus.ACTIVE,
      notes: 'Demo trip for appointment coordination.',
    },
    create: {
      id: '7e5f7019-8f4f-4564-9a6f-83d0235ef4f5',
      patientId: patientProfile.id,
      title: 'Casablanca follow-up trip',
      destination: 'Casablanca',
      startDate: new Date('2026-07-21T09:00:00.000Z'),
      endDate: new Date('2026-07-23T18:00:00.000Z'),
      status: TripStatus.ACTIVE,
      notes: 'Demo trip for appointment coordination.',
    },
  });

  await prisma.tripStop.upsert({
    where: { id: '36c0912c-7bf3-435c-ad14-80772dbcf225' },
    update: {
      tripPlanId: trip.id,
      clinicId: clinic.id,
      professionalId: professionalProfile.id,
      appointmentId: appointment.id,
      title: 'Follow-up consultation',
      location: clinic.address,
      stopDate: new Date('2026-07-22T10:00:00.000Z'),
      position: 0,
      notes: 'Linked to confirmed appointment.',
    },
    create: {
      id: '36c0912c-7bf3-435c-ad14-80772dbcf225',
      tripPlanId: trip.id,
      clinicId: clinic.id,
      professionalId: professionalProfile.id,
      appointmentId: appointment.id,
      title: 'Follow-up consultation',
      location: clinic.address,
      stopDate: new Date('2026-07-22T10:00:00.000Z'),
      position: 0,
      notes: 'Linked to confirmed appointment.',
    },
  });

  const conversation = await prisma.conversation.upsert({
    where: { id: 'd04f1c72-e7b8-4b81-b006-d5ff2dddf141' },
    update: {
      patientId: patientProfile.id,
      careRequestId: careRequest.id,
      appointmentId: appointment.id,
      anchorType: ConversationAnchorType.APPOINTMENT,
      anchorId: appointment.id,
      subject: 'Appointment preparation',
    },
    create: {
      id: 'd04f1c72-e7b8-4b81-b006-d5ff2dddf141',
      patientId: patientProfile.id,
      careRequestId: careRequest.id,
      appointmentId: appointment.id,
      anchorType: ConversationAnchorType.APPOINTMENT,
      anchorId: appointment.id,
      subject: 'Appointment preparation',
    },
  });

  await prisma.conversationParticipant.upsert({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId: patientUser.id,
      },
    },
    update: { role: ConversationParticipantRole.PATIENT },
    create: {
      conversationId: conversation.id,
      userId: patientUser.id,
      role: ConversationParticipantRole.PATIENT,
    },
  });

  await prisma.conversationParticipant.upsert({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId: clinicAdminUser.id,
      },
    },
    update: { role: ConversationParticipantRole.COORDINATOR },
    create: {
      conversationId: conversation.id,
      userId: clinicAdminUser.id,
      role: ConversationParticipantRole.COORDINATOR,
    },
  });

  const message = await prisma.message.upsert({
    where: { id: '9c6d6ef2-e29a-4cf6-a61d-379b9cfa52cb' },
    update: {
      conversationId: conversation.id,
      senderId: clinicAdminUser.id,
      body: 'Please bring your discharge summary to the appointment.',
    },
    create: {
      id: '9c6d6ef2-e29a-4cf6-a61d-379b9cfa52cb',
      conversationId: conversation.id,
      senderId: clinicAdminUser.id,
      body: 'Please bring your discharge summary to the appointment.',
    },
  });

  await prisma.messageReceipt.upsert({
    where: {
      messageId_userId: {
        messageId: message.id,
        userId: patientUser.id,
      },
    },
    update: { status: 'UNREAD', readAt: null },
    create: {
      messageId: message.id,
      userId: patientUser.id,
      status: 'UNREAD',
    },
  });

  const quote = await prisma.quote.upsert({
    where: { id: '59209bd0-5c2a-47f4-b62f-840d679bf87d' },
    update: {
      patientId: patientProfile.id,
      clinicId: clinic.id,
      title: 'Follow-up care package',
      description: 'Consultation and coordination support.',
      currency: 'MAD',
      amount: 120000,
      status: QuoteStatus.SENT,
    },
    create: {
      id: '59209bd0-5c2a-47f4-b62f-840d679bf87d',
      patientId: patientProfile.id,
      clinicId: clinic.id,
      title: 'Follow-up care package',
      description: 'Consultation and coordination support.',
      currency: 'MAD',
      amount: 120000,
      status: QuoteStatus.SENT,
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { id: '62fbb2d1-c7e7-4711-8b5a-ea341e0c51af' },
    update: {
      patientId: patientProfile.id,
      clinicId: clinic.id,
      quoteId: quote.id,
      number: 'INV-SEED-0001',
      currency: 'MAD',
      amount: 120000,
      status: InvoiceStatus.ISSUED,
      issuedAt: new Date('2026-07-10T12:00:00.000Z'),
    },
    create: {
      id: '62fbb2d1-c7e7-4711-8b5a-ea341e0c51af',
      patientId: patientProfile.id,
      clinicId: clinic.id,
      quoteId: quote.id,
      number: 'INV-SEED-0001',
      currency: 'MAD',
      amount: 120000,
      status: InvoiceStatus.ISSUED,
      issuedAt: new Date('2026-07-10T12:00:00.000Z'),
    },
  });

  await prisma.paymentIntent.upsert({
    where: { id: 'f7112314-3c9c-4481-a369-04cb0d477ec6' },
    update: {
      patientId: patientProfile.id,
      invoiceId: invoice.id,
      provider: 'internal',
      currency: 'MAD',
      amount: 120000,
      status: PaymentIntentStatus.PENDING,
    },
    create: {
      id: 'f7112314-3c9c-4481-a369-04cb0d477ec6',
      patientId: patientProfile.id,
      invoiceId: invoice.id,
      provider: 'internal',
      currency: 'MAD',
      amount: 120000,
      status: PaymentIntentStatus.PENDING,
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
