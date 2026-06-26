import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Role } from '../common/enums/role.enum';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { toPublicUser } from './user.mapper';

interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: {
    organizationName?: string;
    specialty?: string;
    licenseNumber?: string;
  };
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.userModel.init();
  }

  async createUser(input: CreateUserInput) {
    const email = input.email.toLowerCase();
    const existingUser = await this.userModel.findOne({ email }).lean().exec();

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    return this.userModel.create({
      email,
      passwordHash: input.passwordHash,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      profile: input.profile ?? {},
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async findPublicByIdOrThrow(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toPublicUser(user);
  }

  async getCurrentUser(userId: string) {
    return this.findPublicByIdOrThrow(userId);
  }

  async updateCurrentUser(userId: string, dto: UpdateCurrentUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
          ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toPublicUser(user);
  }
}
