import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonPatchDto } from './dto/update-lesson-patch.dto';
import { UpdateLessonPutDto } from './dto/update-lesson-put.dto';
import { CreateSubjectDto } from '../subject/dto/create-subject.dto';
import { UpdateSubjectPatchDto } from '../subject/dto/update-subject-patch.dto';
import { UpdateSubjectPutDto } from '../subject/dto/update-subject-put.dto';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  findAll() {
    return this.lessonService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lesson = await this.lessonService.findOne(id);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  @Put(':id')
  updateFull(@Param('id') id: string, @Body() updateLessonPutDto: UpdateLessonPutDto) {
    return this.lessonService.updateFull(id, updateLessonPutDto);
  }

  @Patch(':id')
  updatePartial(@Param('id') id: string, @Body() updateLessonPatchDto: UpdateLessonPatchDto) {
    return this.lessonService.updatePartial(id, updateLessonPatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }

  // Subject Endpoints (Nested under Lesson)

  @Post(':lessonId/subjects')
  createSubject(
    @Param('lessonId') lessonId: string,
    @Body() createSubjectDto: CreateSubjectDto,
  ) {
    return this.lessonService.createSubject(lessonId, createSubjectDto);
  }

  @Get(':lessonId/subjects')
  findAllSubjects(@Param('lessonId') lessonId: string) {
    return this.lessonService.findAllSubjects(lessonId);
  }

  @Get(':lessonId/subjects/:subjectId')
  async findOneSubject(
    @Param('lessonId') lessonId: string,
    @Param('subjectId') subjectId: string,
  ) {
    const subject = await this.lessonService.findOneSubject(lessonId, subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found in Lesson ${lessonId}`);
    }
    return subject;
  }

  @Put(':lessonId/subjects/:subjectId')
  updateFullSubject(
    @Param('lessonId') lessonId: string,
    @Param('subjectId') subjectId: string,
    @Body() updateSubjectPutDto: UpdateSubjectPutDto,
  ) {
    return this.lessonService.updateFullSubject(lessonId, subjectId, updateSubjectPutDto);
  }

  @Patch(':lessonId/subjects/:subjectId')
  updatePartialSubject(
    @Param('lessonId') lessonId: string,
    @Param('subjectId') subjectId: string,
    @Body() updateSubjectPatchDto: UpdateSubjectPatchDto,
  ) {
    return this.lessonService.updatePartialSubject(lessonId, subjectId, updateSubjectPatchDto);
  }

  @Delete(':lessonId/subjects/:subjectId')
  removeSubject(
    @Param('lessonId') lessonId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.lessonService.removeSubject(lessonId, subjectId);
  }
}