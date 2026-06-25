import { Module } from '@nestjs/common';
import { StudentsModule } from '../../modules/students/students.module';
import { CoursesModule } from '../../modules/courses/courses.module';
import { UsersModule } from '../../modules/users/users.module';
import { EnquiriesModule } from '../../modules/enquiries/enquiries.module';
import { AdminStudentsController } from './controllers/admin-students.controller';
import { AdminCoursesController } from './controllers/admin-courses.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminEnquiriesController } from './controllers/admin-enquiries.controller';

@Module({
  imports: [StudentsModule, CoursesModule, UsersModule, EnquiriesModule],
  controllers: [
    AdminStudentsController,
    AdminCoursesController,
    AdminUsersController,
    AdminEnquiriesController,
  ],
})
export class AdminPanelModule {}
