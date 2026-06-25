import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { Enquiry, EnquiryDocument, EnquiryStatus } from './entities/enquiry.entity';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { FilterEnquiryDto } from './dto/filter-enquiry.dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel(Enquiry.name) private readonly enquiryModel: Model<EnquiryDocument>,
  ) {}

  async create(createEnquiryDto: CreateEnquiryDto): Promise<EnquiryDocument> {
    const enquiry = new this.enquiryModel(createEnquiryDto);
    return enquiry.save();
  }

  async findAll(filterDto: FilterEnquiryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', status, type } = filterDto;

    const filter: FilterQuery<EnquiryDocument> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'DESC' ? -1 : 1 } as any;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.enquiryModel
        .find(filter)
        .populate('assignedTo', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.enquiryModel.countDocuments(filter),
    ]);

    return paginate(items, total, page, limit);
  }

  async findOne(id: string): Promise<EnquiryDocument> {
    const enquiry = await this.enquiryModel
      .findById(id)
      .populate('assignedTo', 'firstName lastName email');
    if (!enquiry) throw new NotFoundException(`Enquiry "${id}" not found`);
    return enquiry;
  }

  async update(id: string, updateEnquiryDto: UpdateEnquiryDto): Promise<EnquiryDocument> {
    const update: any = { ...updateEnquiryDto };

    if (updateEnquiryDto.assignedTo) {
      update.assignedTo = new Types.ObjectId(updateEnquiryDto.assignedTo);
    }

    if (updateEnquiryDto.status === EnquiryStatus.RESOLVED) {
      update.resolvedAt = new Date();
    }

    const enquiry = await this.enquiryModel.findByIdAndUpdate(id, update, { new: true });
    if (!enquiry) throw new NotFoundException(`Enquiry "${id}" not found`);
    return enquiry;
  }

  async remove(id: string): Promise<void> {
    const result = await this.enquiryModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Enquiry "${id}" not found`);
  }

  async getStats() {
    const [total, byStatus, byType] = await Promise.all([
      this.enquiryModel.countDocuments(),
      this.enquiryModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.enquiryModel.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);

    const newCount = await this.enquiryModel.countDocuments({ status: EnquiryStatus.NEW });

    return { total, newCount, byStatus, byType };
  }
}
