import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { EnquiryStatus } from '../entities/enquiry.entity';

export class UpdateEnquiryDto {
  @ApiPropertyOptional({ enum: EnquiryStatus })
  @IsEnum(EnquiryStatus)
  @IsOptional()
  status?: EnquiryStatus;

  @ApiPropertyOptional({ example: 'Contacted the student via email.' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminNotes?: string;

  @ApiPropertyOptional({ description: 'MongoDB ObjectId of admin user to assign' })
  @IsMongoId()
  @IsOptional()
  assignedTo?: string;
}
