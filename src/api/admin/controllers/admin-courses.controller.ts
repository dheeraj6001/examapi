import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { CoursesService } from '../../../modules/courses/courses.service';
import { CreateCourseDto } from '../../../modules/courses/dto/create-course.dto';
import { UpdateCourseDto } from '../../../modules/courses/dto/update-course.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';

@ApiTags('Admin — Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all courses (all statuses)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.coursesService.findAll(paginationDto, false);
    return { message: 'Courses retrieved', data: result.items, meta: result.meta };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.coursesService.create(createCourseDto);
    return { message: 'Course created', data: course };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get course statistics' })
  async getStats() {
    const stats = await this.coursesService.getCourseStats();
    return { message: 'Stats retrieved', data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const course = await this.coursesService.findOne(id);
    return { message: 'Course retrieved', data: course };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course by ID' })
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return { message: 'Course updated', data: course };
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a course' })
  async publish(@Param('id', ParseMongoIdPipe) id: string) {
    const course = await this.coursesService.publish(id);
    return { message: 'Course published', data: course };
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a course' })
  async archive(@Param('id', ParseMongoIdPipe) id: string) {
    const course = await this.coursesService.archive(id);
    return { message: 'Course archived', data: course };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course by ID' })
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    await this.coursesService.remove(id);
    return { message: 'Course deleted' };
  }
}
