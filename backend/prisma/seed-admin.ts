import * as argon2 from 'argon2';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const DETACH_EXISTING_PROFILES = process.env.ADMIN_DETACH_EXISTING_PROFILES === 'true';

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

async function main() {
  const email = getRequiredEnv('ADMIN_EMAIL').toLowerCase();
  const password = getRequiredEnv('ADMIN_PASSWORD');

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      patientProfile: true,
      professionalProfile: true,
      clinicMemberships: true,
    },
  });

  const hasAttachedProfile =
    Boolean(existingUser?.patientProfile) ||
    Boolean(existingUser?.professionalProfile) ||
    Boolean(existingUser?.clinicMemberships.length);

  const passwordHash = await argon2.hash(password);

  const user = await prisma.$transaction(async (tx) => {
    if (existingUser && DETACH_EXISTING_PROFILES) {
      await tx.clinicMember.deleteMany({ where: { userId: existingUser.id } });
      await tx.professionalProfile.deleteMany({ where: { userId: existingUser.id } });
      await tx.patientProfile.deleteMany({ where: { userId: existingUser.id } });
    }

    const adminUser = await tx.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: Role.SUPER_ADMIN,
        firstName: 'Platform',
        lastName: 'Admin',
        isActive: true,
      },
      create: {
        email,
        passwordHash,
        role: Role.SUPER_ADMIN,
        firstName: 'Platform',
        lastName: 'Admin',
        isActive: true,
      },
    });

    await tx.patientProfile.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: { userId: adminUser.id },
    });

    await tx.professionalProfile.upsert({
      where: { userId: adminUser.id },
      update: {
        specialty: 'Super administration',
        licenseNumber: 'TRIVACARE-SUPER-ADMIN',
        bio: 'Platform-wide administrator profile for cross-space access.',
      },
      create: {
        userId: adminUser.id,
        specialty: 'Super administration',
        licenseNumber: 'TRIVACARE-SUPER-ADMIN',
        bio: 'Platform-wide administrator profile for cross-space access.',
      },
    });

    return adminUser;
  });

  console.log(`SUPER_ADMIN account ready: ${user.email}`);
  console.log('Password hash stored with Argon2. Plaintext password was not written to the database.');

  if (hasAttachedProfile && !DETACH_EXISTING_PROFILES) {
    console.warn(
      [
        'Existing patient/professional/clinic records were preserved to avoid local data loss.',
        'Set ADMIN_DETACH_EXISTING_PROFILES=true only if you intentionally want to detach them.',
      ].join(' '),
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
