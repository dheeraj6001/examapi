import { Module } from '@nestjs/common';
import { UsersModule } from '../../modules/users/users.module';
import { StudentsModule } from '../../modules/students/students.module';
import { CoursesModule } from '../../modules/courses/courses.module';
import { SuperAdminUsersController } from './controllers/superadmin-users.controller';
import { SuperAdminDashboardController } from './controllers/superadmin-dashboard.controller';
import { SuperAdminAdminsController } from './controllers/superadmin-admins.controller';

@Module({
  imports: [UsersModule, StudentsModule, CoursesModule],
  controllers: [
    SuperAdminDashboardController,
    SuperAdminUsersController,
    SuperAdminAdminsController,
  ],
})
export class SuperAdminPanelModule {}
