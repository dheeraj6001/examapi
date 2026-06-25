import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { UsersService } from '../../../modules/users/users.service';
import { UpdateUserDto } from '../../../modules/users/dto/update-user.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';

@ApiTags('Admin — Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users with pagination' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.usersService.findAll(paginationDto);
    return { message: 'Users retrieved', data: result.items, meta: result.meta };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getStats() {
    const stats = await this.usersService.getUserStats();
    return { message: 'Stats retrieved', data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return { message: 'User retrieved', data: user };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (status, role, etc.)' })
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return { message: 'User updated', data: user };
  }
}
