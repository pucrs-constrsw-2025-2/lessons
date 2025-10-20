import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonPatchDto } from './dto/update-lesson-patch.dto';
import { UpdateLessonPutDto } from './dto/update-lesson-put.dto';
import { CreateSubjectDto } from '../subject/dto/create-subject.dto';
import { UpdateSubjectPatchDto } from '../subject/dto/update-subject-patch.dto';
import { UpdateSubjectPutDto } from '../subject/dto/update-subject-put.dto';
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

  async updateFull(id: string, updateLessonPutDto: UpdateLessonPutDto) {
    const existingLesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!existingLesson) {
      throw new Error(`Lesson with ID ${id} not found`);
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonPutDto,
    });
  }

  updatePartial(id: string, updateLessonPatchDto: UpdateLessonPatchDto) {
    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonPatchDto,
    });
  }

  remove(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  // Subject Service Methods (Nested under Lesson)

  async createSubject(lessonId: string, createSubjectDto: CreateSubjectDto) {
    await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    return this.prisma.subject.create({
      data: { ...createSubjectDto, lessonId },
    });
  }

  findAllSubjects(lessonId: string) {
    return this.prisma.subject.findMany({ where: { lessonId } });
  }

  async findOneSubject(lessonId: string, subjectId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId, lessonId },
    });
    if (!subject) {
      throw new Error(`Subject with ID ${subjectId} not found in Lesson ${lessonId}`);
    }
    return subject;
  }

  async updateFullSubject(
    lessonId: string,
    subjectId: string,
    updateSubjectPutDto: UpdateSubjectPutDto,
  ) {
    await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    const existingSubject = await this.prisma.subject.findUnique({
      where: { id: subjectId, lessonId },
    });
    if (!existingSubject) {
      throw new Error(`Subject with ID ${subjectId} not found in Lesson ${lessonId}`);
    }

    return this.prisma.subject.update({
      where: { id: subjectId, lessonId },
      data: updateSubjectPutDto,
    });
  }

  async updatePartialSubject(
    lessonId: string,
    subjectId: string,
    updateSubjectPatchDto: UpdateSubjectPatchDto,
  ) {
    await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    const existingSubject = await this.prisma.subject.findUnique({
      where: { id: subjectId, lessonId },
    });
    if (!existingSubject) {
      throw new Error(`Subject with ID ${subjectId} not found in Lesson ${lessonId}`);
    }

    return this.prisma.subject.update({
      where: { id: subjectId, lessonId },
      data: updateSubjectPatchDto,
    });
  }

  async removeSubject(lessonId: string, subjectId: string) {
    await this.prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    const existingSubject = await this.prisma.subject.findUnique({
      where: { id: subjectId, lessonId },
    });
    if (!existingSubject) {
      throw new Error(`Subject with ID ${subjectId} not found in Lesson ${lessonId}`);
    }

    return this.prisma.subject.delete({ where: { id: subjectId, lessonId } });
  }
}