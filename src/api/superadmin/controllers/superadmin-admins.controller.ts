import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { UsersService } from '../../../modules/users/users.service';
import { CreateUserDto } from '../../../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../modules/users/dto/update-user.dto';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';

@ApiTags('Super Admin — Admins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('superadmin/admins')
export class SuperAdminAdminsController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '[SuperAdmin] Create a new admin account' })
  async createAdmin(@Body() createUserDto: CreateUserDto) {
    const admin = await this.usersService.create({ ...createUserDto, role: Role.ADMIN });
    return { message: 'Admin account created', data: admin };
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: '[SuperAdmin] Revoke admin privileges (demote to student)' })
  async revokeAdmin(@Param('id', ParseMongoIdPipe) id: string) {
    const user = await this.usersService.update(id, { role: Role.STUDENT } as UpdateUserDto);
    return { message: 'Admin privileges revoked', data: user };
  }

  @Patch(':id/elevate')
  @ApiOperation({ summary: '[SuperAdmin] Elevate user to super admin' })
  async elevateToSuperAdmin(@Param('id', ParseMongoIdPipe) id: string) {
    const user = await this.usersService.update(id, { role: Role.SUPER_ADMIN } as UpdateUserDto);
    return { message: 'User elevated to Super Admin', data: user };
  }
}
