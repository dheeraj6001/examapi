import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { Student, StudentDocument } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<StudentDocument>,
  ) {}

  private generateStudentCode(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `STU-${year}-${random}`;
  }

  async create(createStudentDto: CreateStudentDto): Promise<StudentDocument> {
    const existing = await this.studentModel.findOne({
      userId: new Types.ObjectId(createStudentDto.userId),
    });
    if (existing) throw new ConflictException('Student profile already exists for this user');

    const student = new this.studentModel({
      ...createStudentDto,
      userId: new Types.ObjectId(createStudentDto.userId),
      studentCode: createStudentDto.studentCode || this.generateStudentCode(),
      enrollmentDate: new Date(),
    });

    return student.save();
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;

    const filter: FilterQuery<StudentDocument> = {};
    if (search) {
      filter.$or = [
        { studentCode: { $regex: search, $options: 'i' } },
        { grade: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'DESC' ? -1 : 1 } as any;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .populate('userId', '-passwordHash -refreshToken')
        .populate('courses', 'title courseCode status')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.studentModel.countDocuments(filter),
    ]);

    return paginate(items, total, page, limit);
  }

  async findOne(id: string): Promise<StudentDocument> {
    const student = await this.studentModel
      .findById(id)
      .populate('userId', '-passwordHash -refreshToken')
      .populate('courses', 'title courseCode status level price');

    if (!student) throw new NotFoundException(`Student "${id}" not found`);
    return student;
  }

  async findByUserId(userId: string): Promise<StudentDocument> {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', '-passwordHash -refreshToken')
      .populate('courses', 'title courseCode status level price');

    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<StudentDocument> {
    const student = await this.studentModel.findByIdAndUpdate(id, updateStudentDto, { new: true });
    if (!student) throw new NotFoundException(`Student "${id}" not found`);
    return student;
  }

  async remove(id: string): Promise<void> {
    const result = await this.studentModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Student "${id}" not found`);
  }

  async getStudentStats() {
    const [total, byStatus] = await Promise.all([
      this.studentModel.countDocuments(),
      this.studentModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    return { total, byStatus };
  }
}
