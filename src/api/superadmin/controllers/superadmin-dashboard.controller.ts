import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { UsersService } from '../../../modules/users/users.service';
import { StudentsService } from '../../../modules/students/students.service';
import { CoursesService } from '../../../modules/courses/courses.service';

@ApiTags('Super Admin — Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('superadmin/dashboard')
export class SuperAdminDashboardController {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  @Get()
  @ApiOperation({ summary: '[SuperAdmin] Platform overview dashboard' })
  async getDashboard() {
    const [userStats, studentStats, courseStats] = await Promise.all([
      this.usersService.getUserStats(),
      this.studentsService.getStudentStats(),
      this.coursesService.getCourseStats(),
    ]);

    return {
      message: 'Dashboard data retrieved',
      data: {
        platform: {
          generatedAt: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
        users: userStats,
        students: studentStats,
        courses: courseStats,
      },
    };
  }
}
