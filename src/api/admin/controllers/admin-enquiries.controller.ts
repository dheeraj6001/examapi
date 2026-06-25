import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { EnquiriesService } from '../../../modules/enquiries/enquiries.service';
import { UpdateEnquiryDto } from '../../../modules/enquiries/dto/update-enquiry.dto';
import { FilterEnquiryDto } from '../../../modules/enquiries/dto/filter-enquiry.dto';
import { ParseMongoIdPipe } from '../../../common/pipes/parse-mongo-id.pipe';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { EnquiryStatus } from '../../../modules/enquiries/entities/enquiry.entity';

@ApiTags('Admin — Enquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/enquiries')
export class AdminEnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all enquiries with filters and pagination' })
  async findAll(@Query() filterDto: FilterEnquiryDto) {
    const result = await this.enquiriesService.findAll(filterDto);
    return { message: 'Enquiries retrieved', data: result.items, meta: result.meta };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get enquiry statistics (total, new, by status/type)' })
  async getStats() {
    const stats = await this.enquiriesService.getStats();
    return { message: 'Stats retrieved', data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enquiry by ID' })
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const enquiry = await this.enquiriesService.findOne(id);
    return { message: 'Enquiry retrieved', data: enquiry };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update enquiry status, notes, or assignment' })
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateEnquiryDto: UpdateEnquiryDto,
  ) {
    const enquiry = await this.enquiriesService.update(id, updateEnquiryDto);
    return { message: 'Enquiry updated', data: enquiry };
  }

  @Patch(':id/assign-me')
  @ApiOperation({ summary: 'Assign enquiry to yourself' })
  async assignToMe(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const enquiry = await this.enquiriesService.update(id, {
      assignedTo: user.sub,
      status: EnquiryStatus.IN_PROGRESS,
    });
    return { message: 'Enquiry assigned', data: enquiry };
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Mark enquiry as resolved' })
  async resolve(@Param('id', ParseMongoIdPipe) id: string) {
    const enquiry = await this.enquiriesService.update(id, { status: EnquiryStatus.RESOLVED });
    return { message: 'Enquiry resolved', data: enquiry };
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close an enquiry' })
  async close(@Param('id', ParseMongoIdPipe) id: string) {
    const enquiry = await this.enquiriesService.update(id, { status: EnquiryStatus.CLOSED });
    return { message: 'Enquiry closed', data: enquiry };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete enquiry' })
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    await this.enquiriesService.remove(id);
    return { message: 'Enquiry deleted' };
  }
}
