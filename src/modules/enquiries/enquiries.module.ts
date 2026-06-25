import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enquiry, EnquirySchema } from './entities/enquiry.entity';
import { EnquiriesService } from './enquiries.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Enquiry.name, schema: EnquirySchema }])],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
