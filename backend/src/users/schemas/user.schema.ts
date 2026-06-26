import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Role } from '../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserProfile {
  @Prop({ trim: true })
  organizationName?: string;

  @Prop({ trim: true })
  specialty?: string;

  @Prop({ trim: true })
  licenseNumber?: string;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(Role),
  })
  role!: Role;

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({
    type: UserProfileSchema,
    default: () => ({}),
  })
  profile!: UserProfile;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
