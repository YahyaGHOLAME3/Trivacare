import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class RefreshToken {
  _id!: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  revokedAt?: Date;

  createdAt!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
