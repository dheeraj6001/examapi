import { Module } from '@nestjs/common';
import { StudentsModule } from '../../modules/students/students.module';
import { CoursesModule } from '../../modules/courses/courses.module';
import { UsersModule } from '../../modules/users/users.module';
import { StudentProfileController } from './controllers/student-profile.controller';
import { StudentCoursesController } from './controllers/student-courses.controller';

@Module({
  imports: [StudentsModule, CoursesModule, UsersModule],
  controllers: [StudentProfileController, StudentCoursesController],
})
export class StudentPanelModule {}
