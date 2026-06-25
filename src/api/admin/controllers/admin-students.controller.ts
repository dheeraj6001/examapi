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
import { StudentsService } from '../../../modules/students/students.service';
import { CreateStudentDto } from '../../../modules/students/dto/create-student.dto';
import { UpdateStudentDto } from '../../../modules/students/dto/update-student.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';

@ApiTags('Admin — Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/students')
export class AdminStudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all students with pagination' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.studentsService.findAll(paginationDto);
    return { message: 'Students retrieved', data: result.items, meta: result.meta };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new student profile' })
  async create(@Body() createStudentDto: CreateStudentDto) {
    const student = await this.studentsService.create(createStudentDto);
    return { message: 'Student created', data: student };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get student statistics' })
  async getStats() {
    const stats = await this.studentsService.getStudentStats();
    return { message: 'Stats retrieved', data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const student = await this.studentsService.findOne(id);
    return { message: 'Student retrieved', data: student };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student by ID' })
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.studentsService.update(id, updateStudentDto);
    return { message: 'Student updated', data: student };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student by ID' })
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    await this.studentsService.remove(id);
    return { message: 'Student deleted' };
  }
}
