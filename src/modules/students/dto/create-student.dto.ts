import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the linked User' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ example: 'STU-2024-001' })
  @IsString()
  @IsOptional()
  studentCode?: string;

  @ApiPropertyOptional({ example: '10th' })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsString()
  @IsOptional()
  section?: string;

  @ApiPropertyOptional({ example: '2005-01-15' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guardianName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  guardianEmail?: string;
}
