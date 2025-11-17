import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectPatchDto } from './dto/update-subject-patch.dto';
import { UpdateSubjectPutDto } from './dto/update-subject-put.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  async create(lessonId: string, createSubjectDto: CreateSubjectDto) {
    await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    return this.prisma.subject.create({
      data: { ...createSubjectDto, lessonId },
    });
  }

  async findAll(lessonId: string) {
    await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    return this.prisma.subject.findMany({ where: { lessonId } });
  }

  async findOne(lessonId: string, subjectId: string) {
    await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, lessonId },
    });
    if (!subject) {
      throw new NotFoundException(
        `Subject with ID ${subjectId} not found in Lesson ${lessonId}`,
      );
    }
    return subject;
  }

  async updateFull(
    lessonId: string,
    subjectId: string,
    updateSubjectDto: UpdateSubjectPutDto,
  ) {
    await this.ensureBelongsToLesson(lessonId, subjectId);
    return this.prisma.subject.update({
      where: { id: subjectId },
      data: updateSubjectDto,
    });
  }

  async updatePartial(
    lessonId: string,
    subjectId: string,
    updateSubjectDto: UpdateSubjectPatchDto,
  ) {
    await this.ensureBelongsToLesson(lessonId, subjectId);
    return this.prisma.subject.update({
      where: { id: subjectId },
      data: updateSubjectDto,
    });
  }

  async remove(lessonId: string, subjectId: string) {
    await this.ensureBelongsToLesson(lessonId, subjectId);
    return this.prisma.subject.delete({ where: { id: subjectId } });
  }

  private async ensureBelongsToLesson(lessonId: string, subjectId: string) {
    const found = await this.prisma.subject.findFirst({
      where: { id: subjectId, lessonId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(
        `Subject with ID ${subjectId} not found in Lesson ${lessonId}`,
      );
    }
  }
}
