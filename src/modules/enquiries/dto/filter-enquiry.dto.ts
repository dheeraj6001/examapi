import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { EnquiryStatus, EnquiryType } from '../entities/enquiry.entity';

export class FilterEnquiryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: EnquiryStatus })
  @IsEnum(EnquiryStatus)
  @IsOptional()
  status?: EnquiryStatus;

  @ApiPropertyOptional({ enum: EnquiryType })
  @IsEnum(EnquiryType)
  @IsOptional()
  type?: EnquiryType;
}
