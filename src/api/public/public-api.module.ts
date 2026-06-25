import { Module } from '@nestjs/common';
import { CoursesModule } from '../../modules/courses/courses.module';
import { EnquiriesModule } from '../../modules/enquiries/enquiries.module';
import { PublicCoursesController } from './controllers/public-courses.controller';
import { HealthController } from './controllers/health.controller';
import { PublicEnquiryController } from './controllers/public-enquiry.controller';

@Module({
  imports: [CoursesModule, EnquiriesModule],
  controllers: [HealthController, PublicCoursesController, PublicEnquiryController],
})
export class PublicApiModule {}
