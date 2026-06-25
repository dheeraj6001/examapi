import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { StudentsService } from '../../../modules/students/students.service';
import { UsersService } from '../../../modules/users/users.service';
import { UpdateStudentDto } from '../../../modules/students/dto/update-student.dto';
import { UpdateUserDto } from '../../../modules/users/dto/update-user.dto';
import { ChangePasswordDto } from '../../../modules/users/dto/change-password.dto';

@ApiTags('Student — Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('student/profile')
export class StudentProfileController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get my student profile' })
  async getMyProfile(@CurrentUser() user: JwtPayload) {
    const student = await this.studentsService.findByUserId(user.sub);
    return { message: 'Profile retrieved', data: student };
  }

  @Patch()
  @ApiOperation({ summary: 'Update my student profile' })
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.studentsService.findByUserId(user.sub);
    const updated = await this.studentsService.update(student.id, updateStudentDto);
    return { message: 'Profile updated', data: updated };
  }

  @Patch('account')
  @ApiOperation({ summary: 'Update my account info (name, phone)' })
  async updateAccount(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(user.sub, updateUserDto);
    return { message: 'Account updated', data: updated };
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change my password' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.sub, dto);
    return { message: 'Password changed successfully' };
  }
}
