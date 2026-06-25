import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { EnquiriesService } from '../../../modules/enquiries/enquiries.service';
import { CreateEnquiryDto } from '../../../modules/enquiries/dto/create-enquiry.dto';

@ApiTags('Public — Enquiry')
@Public()
@Controller('enquiry')
export class PublicEnquiryController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an enquiry (no auth required)' })
  async submit(@Body() createEnquiryDto: CreateEnquiryDto) {
    const enquiry = await this.enquiriesService.create(createEnquiryDto);
    return {
      message: 'Enquiry submitted successfully. We will get back to you shortly.',
      data: {
        id: enquiry._id,
        name: enquiry.name,
        email: enquiry.email,
        subject: enquiry.subject,
        type: enquiry.type,
        status: enquiry.status,
        createdAt: (enquiry as any).createdAt,
      },
    };
  }
}
