import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EnquiryDocument = HydratedDocument<Enquiry>;

export enum EnquiryStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum EnquiryType {
  GENERAL = 'general',
  ADMISSION = 'admission',
  COURSE = 'course',
  SUPPORT = 'support',
  FEEDBACK = 'feedback',
}

@Schema({ timestamps: true, collection: 'enquiries' })
export class Enquiry {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  subject: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  message: string;

  @Prop({ type: String, enum: EnquiryType, default: EnquiryType.GENERAL })
  type: EnquiryType;

  @Prop({ type: String, enum: EnquiryStatus, default: EnquiryStatus.NEW })
  status: EnquiryStatus;

  @Prop({ trim: true })
  adminNotes: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId;

  @Prop()
  resolvedAt: Date;
}

export const EnquirySchema = SchemaFactory.createForClass(Enquiry);
