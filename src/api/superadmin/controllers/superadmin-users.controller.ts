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
import { UsersService } from '../../../modules/users/users.service';
import { CreateUserDto } from '../../../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../modules/users/dto/update-user.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';

@ApiTags('Super Admin — Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('superadmin/users')
export class SuperAdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '[SuperAdmin] List all users' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.usersService.findAll(paginationDto);
    return { message: 'Users retrieved', data: result.items, meta: result.meta };
  }

  @Post()
  @ApiOperation({ summary: '[SuperAdmin] Create any user with any role' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { message: 'User created', data: user };
  }

  @Get('stats')
  @ApiOperation({ summary: '[SuperAdmin] Platform-wide user statistics' })
  async getStats() {
    const stats = await this.usersService.getUserStats();
    return { message: 'Stats retrieved', data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: '[SuperAdmin] Get user by ID' })
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return { message: 'User retrieved', data: user };
  }

  @Patch(':id')
  @ApiOperation({ summary: '[SuperAdmin] Update user (including role elevation)' })
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return { message: 'User updated', data: user };
  }

  @Delete(':id')
  @ApiOperation({ summary: '[SuperAdmin] Hard delete user' })
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted' };
  }
}
