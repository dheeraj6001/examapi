import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { CoursesService } from '../../../modules/courses/courses.service';
import { StudentsService } from '../../../modules/students/students.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';

@ApiTags('Student — Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('student/courses')
export class StudentCoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Browse all published courses available for enrollment' })
  async browseCourses(@Query() paginationDto: PaginationDto) {
    const result = await this.coursesService.findAll(paginationDto, true);
    return { message: 'Courses retrieved', data: result.items, meta: result.meta };
  }

  @Get('my-enrollments')
  @ApiOperation({ summary: 'Get my enrolled courses' })
  async getMyEnrollments(@CurrentUser() user: JwtPayload) {
    const student = await this.studentsService.findByUserId(user.sub);
    return { message: 'Enrollments retrieved', data: student.courses };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details' })
  async getCourse(@Param('id', ParseMongoIdPipe) id: string) {
    const course = await this.coursesService.findOne(id);
    return { message: 'Course retrieved', data: course };
  }
}
