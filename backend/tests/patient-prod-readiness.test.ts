import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { RolesGuard } from '../src/common/guards/roles.guard';
import { MessagingService } from '../src/messaging/messaging.service';
import { PatientsService } from '../src/patients/patients.service';
import { SecurityService } from '../src/security/security.service';
import { toPublicUser } from '../src/users/user.mapper';
import { UsersService } from '../src/users/users.service';

const auditLogs = {
  create: async () => undefined,
};

test('patient signup creates independent blank patient profiles', async () => {
  const users: Array<Record<string, unknown>> = [];
  const profiles: Array<Record<string, unknown>> = [];
  let nextUserId = 1;

  const tx = {
    user: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const user = { id: `user-${nextUserId++}`, ...data };
        users.push(user);
        return user;
      },
    },
    patientProfile: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const profile = { id: `profile-${profiles.length + 1}`, ...data };
        profiles.push(profile);
        return profile;
      },
    },
  };
  const prisma = {
    user: {
      findUnique: async ({ where }: { where: { email: string } }) =>
        users.find((user) => user.email === where.email) ?? null,
    },
    $transaction: async (callback: (transaction: typeof tx) => unknown) =>
      callback(tx),
  };
  const service = new UsersService(prisma as never);

  await service.createUser({
    email: 'one@example.test',
    passwordHash: 'hash',
    role: Role.PATIENT,
  });
  await service.createUser({
    email: 'two@example.test',
    passwordHash: 'hash',
    role: Role.PATIENT,
  });

  assert.equal(profiles.length, 2);
  assert.notEqual(profiles[0].userId, profiles[1].userId);
  assert.equal(profiles[0].medicalSummary, undefined);
  assert.equal(profiles[1].medicalSummary, undefined);
});

test('patient dossier updates persist only on the current patient profile', async () => {
  const profiles = new Map([
    ['patient-a', { id: 'profile-a', userId: 'patient-a', medicalSummary: null }],
    ['patient-b', { id: 'profile-b', userId: 'patient-b', medicalSummary: null }],
  ]);
  const prisma = {
    patientProfile: {
      upsert: async ({
        where,
        update,
        create,
      }: {
        where: { userId: string };
        update: Record<string, unknown>;
        create: Record<string, unknown>;
      }) => {
        const existing = profiles.get(where.userId);
        const next = existing
          ? { ...existing, ...update }
          : { id: `profile-${where.userId}`, ...create };
        profiles.set(where.userId, next);
        return next;
      },
    },
  };
  const service = new PatientsService(prisma as never, auditLogs as never);

  await service.upsertMe('patient-a', {
    medicalSummary: 'Allergy to penicillin',
  });

  assert.equal(profiles.get('patient-a')?.medicalSummary, 'Allergy to penicillin');
  assert.equal(profiles.get('patient-b')?.medicalSummary, null);
});

test('security sessions return active persisted devices only', async () => {
  const now = Date.now();
  const sessions = [
    {
      id: 'current-session',
      userId: 'patient-a',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
      ipAddress: '127.0.0.1',
      expiresAt: new Date(now + 60_000),
      lastSeenAt: new Date(now - 10_000),
      revokedAt: null,
      createdAt: new Date(now - 20_000),
    },
    {
      id: 'revoked-phone',
      userId: 'patient-a',
      userAgent: 'iPhone 14 Safari Marrakech',
      ipAddress: '127.0.0.2',
      expiresAt: new Date(now + 60_000),
      lastSeenAt: new Date(now - 5_000),
      revokedAt: new Date(now - 1_000),
      createdAt: new Date(now - 30_000),
    },
  ];
  const prisma = {
    userSession: {
      updateMany: async () => ({ count: 1 }),
      findMany: async () =>
        sessions.filter(
          (session) =>
            session.userId === 'patient-a' &&
            !session.revokedAt &&
            session.expiresAt > new Date(),
        ),
    },
  };
  const service = new SecurityService(prisma as never, auditLogs as never);

  const result = await service.listSessions({
    userId: 'patient-a',
    role: Role.PATIENT,
    sessionId: 'current-session',
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'current-session');
  assert.equal(result[0].isCurrent, true);
  assert.equal(result[0].device.label, 'MacBook · Chrome');
});

test('public user serialization excludes credential and MFA fields', () => {
  const publicUser = toPublicUser({
    id: 'admin-user',
    email: 'admin@example.test',
    role: Role.SUPER_ADMIN,
    firstName: 'Platform',
    lastName: 'Admin',
    phone: null,
    isActive: true,
    createdAt: new Date('2026-07-19T00:00:00.000Z'),
    updatedAt: new Date('2026-07-19T00:00:00.000Z'),
    passwordHash: 'argon2-hash',
    refreshTokenHash: 'refresh-hash',
    mfaMethods: [{ secret: 'totp-secret' }],
    recoveryCodes: [{ codeHash: 'recovery-hash' }],
  } as never);

  const serialized = JSON.stringify(publicUser);

  assert.equal(publicUser.email, 'admin@example.test');
  assert.equal(publicUser.role, Role.SUPER_ADMIN);
  assert.doesNotMatch(serialized, /passwordHash|refreshTokenHash|secret|codeHash/);
  assert.doesNotMatch(serialized, /argon2-hash|refresh-hash|totp-secret|recovery-hash/);
});

test('super admin satisfies persona-specific backend role guards', () => {
  const guard = new RolesGuard({
    getAllAndOverride: () => [Role.PATIENT],
  } as never);
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          userId: 'super-admin',
          role: Role.SUPER_ADMIN,
        },
      }),
    }),
  };

  assert.equal(guard.canActivate(context as never), true);
});

test('patient messaging creates a persisted coordinator conversation and receipt', async () => {
  const created = {
    conversations: [] as Array<Record<string, unknown>>,
    participants: [] as Array<Record<string, unknown>>,
    messages: [] as Array<Record<string, unknown>>,
    receipts: [] as Array<Record<string, unknown>>,
  };
  const users = [
    { id: 'patient-user', role: Role.PATIENT, isActive: true, createdAt: new Date() },
    {
      id: 'coordinator-user',
      role: Role.CLINIC_ADMIN,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'professional-user',
      role: Role.PROFESSIONAL,
      isActive: true,
      createdAt: new Date(),
    },
  ];
  const patientProfile = { id: 'patient-profile', userId: 'patient-user' };
  const tx = {
    conversation: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const conversation = { id: 'thread-1', ...data };
        created.conversations.push(conversation);
        const participants = data.participants as { create: Array<Record<string, unknown>> };
        created.participants.push(
          ...participants.create.map((participant) => ({
            id: `participant-${created.participants.length + 1}`,
            conversationId: conversation.id,
            ...participant,
          })),
        );
        return conversation;
      },
      update: async () => undefined,
      findUniqueOrThrow: async () => ({
        id: 'thread-1',
        patient: patientProfile,
        participants: created.participants,
        messages: created.messages,
      }),
    },
    conversationParticipant: {
      findMany: async () =>
        created.participants.map((participant) => ({
          userId: participant.userId,
        })),
    },
    message: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const message = {
          id: 'message-1',
          ...data,
          sender: users.find((user) => user.id === data.senderId),
          receipts: [],
        };
        created.messages.push(message);
        return message;
      },
    },
    messageReceipt: {
      createMany: async ({ data }: { data: Array<Record<string, unknown>> }) => {
        created.receipts.push(...data);
        return { count: data.length };
      },
    },
  };
  const prisma = {
    user: {
      findFirst: async () => users.find((user) => user.role === Role.SUPER_ADMIN),
      findMany: async () => [],
      count: async ({ where }: { where: { id: { in: string[] } } }) =>
        users.filter((user) => where.id.in.includes(user.id) && user.isActive).length,
    },
    clinicMember: {
      findMany: async () => [{ userId: 'coordinator-user' }],
    },
    careRequest: {
      findFirst: async () => ({
        clinic: {
          members: [{ userId: 'coordinator-user' }],
        },
      }),
    },
    appointment: {
      findFirst: async () => null,
    },
    professionalProfile: {
      findMany: async ({ where }: { where: { userId?: { in: string[] } } }) =>
        where.userId?.in.includes('professional-user')
          ? [{ id: 'professional-profile', userId: 'professional-user' }]
          : [],
    },
    $transaction: async (callback: (transaction: typeof tx) => unknown) =>
      callback(tx),
  };
  const patientsService = {
    getProfileByUserIdOrThrow: async () => patientProfile,
    getProfileByIdOrThrow: async () => patientProfile,
  };
  const service = new MessagingService(
    prisma as never,
    patientsService as never,
    auditLogs as never,
  );

  await service.createThread(
    { userId: 'patient-user', role: Role.PATIENT },
    {
      anchorType: 'PATIENT_CASE',
      anchorId: patientProfile.id,
      subject: 'Coordination patient',
      initialMessage: 'Bonjour',
    },
  );

  assert.equal(created.conversations.length, 1);
  assert.deepEqual(
    created.participants.map((participant) => participant.userId).sort(),
    ['coordinator-user', 'patient-user'],
  );
  assert.equal(created.messages.length, 1);
  assert.equal(created.receipts.length, 1);
  assert.equal(created.receipts[0].userId, 'coordinator-user');
  assert.equal(
    created.participants.find((participant) => participant.userId === 'coordinator-user')
      ?.role,
    'COORDINATOR',
  );
});

test('patient messaging rejects participants outside the care team', async () => {
  const patientProfile = { id: 'patient-profile', userId: 'patient-user' };
  const prisma = {
    clinicMember: {
      findMany: async () => [],
    },
    professionalProfile: {
      findMany: async () => [],
    },
    user: {
      findMany: async () => [],
    },
  };
  const patientsService = {
    getProfileByUserIdOrThrow: async () => patientProfile,
  };
  const service = new MessagingService(
    prisma as never,
    patientsService as never,
    auditLogs as never,
  );

  await assert.rejects(
    () =>
      service.createThread(
        { userId: 'patient-user', role: Role.PATIENT },
        {
          anchorType: 'PATIENT_CASE',
          anchorId: patientProfile.id,
          subject: 'Coordination patient',
          participantUserIds: ['outsider-user'],
        },
      ),
    ForbiddenException,
  );
});

test('patient frontend targets account onboarding and avoids seeded authenticated defaults', () => {
  const authSource = readFileSync(
    new URL('../../src/shared/auth.jsx', import.meta.url),
    'utf8',
  );
  const patientSource = readFileSync(
    new URL('../../src/patient/patient-app.jsx', import.meta.url),
    'utf8',
  );

  assert.match(authSource, /PATIENT:\s*"\/patient\/compte"/);
  assert.match(authSource, /session\.user\?\.role === "SUPER_ADMIN"/);
  assert.match(authSource, /PERSONAS\.forEach/);
  assert.match(authSource, /!isSuperAdmin/);
  assert.match(patientSource, /apiRequest\("\/patients\/me\/profile"/);
  assert.match(patientSource, /onboarding && page !== "compte"/);
  assert.match(patientSource, /<Navigate to="\/patient\/compte" replace \/>/);
  assert.match(patientSource, /apiRequest\("\/security\/sessions"/);
  assert.match(patientSource, /apiRequest\("\/threads"/);
  assert.doesNotMatch(
    patientSource,
    /defaultValue="(?:Casablanca|2026-07-08|2|123456789)"/,
  );
});
