import { Role } from '../common/enums/role.enum';

interface UserLike {
  id?: string;
  _id?: string | { toString(): string };
  email: string;
  role: Role;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isActive: boolean;
  profile?: {
    organizationName?: string;
    specialty?: string;
    licenseNumber?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export function toPublicUser(user: UserLike) {
  return {
    id: user.id ?? user._id?.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    phone: user.phone ?? null,
    isActive: user.isActive,
    profile: {
      organizationName: user.profile?.organizationName ?? null,
      specialty: user.profile?.specialty ?? null,
      licenseNumber: user.profile?.licenseNumber ?? null,
    },
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
}
