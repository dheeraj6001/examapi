import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Schema({ timestamps: true, collection: 'courses' })
export class Course {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  courseCode: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  instructor: string;

  @Prop({ trim: true })
  category: string;

  @Prop({ type: String, enum: CourseLevel, default: CourseLevel.BEGINNER })
  level: CourseLevel;

  @Prop({ type: String, enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  @Prop({ type: Number, min: 0 })
  price: number;

  @Prop({ type: Number, min: 1 })
  maxStudents: number;

  @Prop({ type: Number, min: 1 })
  durationHours: number;

  @Prop({ trim: true })
  thumbnailUrl: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
