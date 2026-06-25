import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoursesService } from '../../../modules/courses/courses.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';

@ApiTags('Public — Courses')
@Public()
@Controller('courses')
export class PublicCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all published courses (no auth required)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.coursesService.findAll(paginationDto, true);
    return { message: 'Courses retrieved', data: result.items, meta: result.meta };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single published course by ID' })
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const course = await this.coursesService.findOne(id);
    return { message: 'Course retrieved', data: course };
  }
}
