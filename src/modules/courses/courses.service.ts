import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Course, CourseDocument, CourseStatus } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/helpers/pagination.helper';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    const existing = await this.courseModel.findOne({
      courseCode: createCourseDto.courseCode.toUpperCase(),
    });
    if (existing) throw new ConflictException('Course code already exists');

    const course = new this.courseModel(createCourseDto);
    return course.save();
  }

  async findAll(paginationDto: PaginationDto, publishedOnly = false) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;

    const filter: FilterQuery<CourseDocument> = {};
    if (publishedOnly) filter.status = CourseStatus.PUBLISHED;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'DESC' ? -1 : 1 } as any;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.courseModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.courseModel.countDocuments(filter),
    ]);

    return paginate(items, total, page, limit);
  }

  async findOne(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException(`Course "${id}" not found`);
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseDocument> {
    if (updateCourseDto.courseCode) {
      const existing = await this.courseModel.findOne({
        courseCode: updateCourseDto.courseCode.toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) throw new ConflictException('Course code already in use');
    }

    const course = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true });
    if (!course) throw new NotFoundException(`Course "${id}" not found`);
    return course;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException(`Course "${id}" not found`);
  }

  async publish(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndUpdate(
      id,
      { status: CourseStatus.PUBLISHED },
      { new: true },
    );
    if (!course) throw new NotFoundException(`Course "${id}" not found`);
    return course;
  }

  async archive(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndUpdate(
      id,
      { status: CourseStatus.ARCHIVED },
      { new: true },
    );
    if (!course) throw new NotFoundException(`Course "${id}" not found`);
    return course;
  }

  async getCourseStats() {
    const [total, byStatus, byLevel] = await Promise.all([
      this.courseModel.countDocuments(),
      this.courseModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.courseModel.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }]),
    ]);
    return { total, byStatus, byLevel };
  }
}
