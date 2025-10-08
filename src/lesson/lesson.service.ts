import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  create(createLessonDto: CreateLessonDto) {
    return this.prisma.lesson.create({ data: createLessonDto });
  }

  findAll() {
    return this.prisma.lesson.findMany();
  }

  findOne(id: string) {
    return this.prisma.lesson.findUnique({ where: { id } });
  }

  update(id: string, updateLessonDto: UpdateLessonDto) {
    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  remove(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }
}