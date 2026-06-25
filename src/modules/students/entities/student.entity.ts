import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true, collection: 'students' })
export class Student {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  studentCode: string;

  @Prop({ trim: true })
  grade: string;

  @Prop({ trim: true })
  section: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  guardianName: string;

  @Prop({ trim: true })
  guardianPhone: string;

  @Prop({ lowercase: true, trim: true })
  guardianEmail: string;

  @Prop({ type: String, enum: EnrollmentStatus, default: EnrollmentStatus.ENROLLED })
  status: EnrollmentStatus;

  @Prop({ default: Date.now })
  enrollmentDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  courses: Types.ObjectId[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);
