import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectPatchDto } from './dto/update-subject-patch.dto';
import { UpdateSubjectPutDto } from './dto/update-subject-put.dto';

// Nested routing under lessons: /lessons/:lessonId/subjects
@Controller('lessons/:lessonId/subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  create(
    @Param('lessonId', new ParseUUIDPipe({ version: '4' })) lessonId: string,
    @Body() createSubjectDto: CreateSubjectDto,
  ) {
    return this.subjectService.create(lessonId, createSubjectDto);
  }

  @Get()
  async findAll(
    @Param('lessonId', new ParseUUIDPipe({ version: '4' })) lessonId: string,
  ) {
    const items = await this.subjectService.findAll(lessonId);
    if (!items || items.length === 0) {
      throw new HttpException('', HttpStatus.NO_CONTENT);
    }
    return items;
  }

  @Get(':subjectId')
  findOne(
    @Param('lessonId', new ParseUUIDPipe({ version: '4' })) lessonId: string,
    @Param('subjectId', new ParseUUIDPipe({ version: '4' })) subjectId: string,
  ) {
    return this.subjectService.findOne(lessonId, subjectId);
  }

  @Put(':subjectId')
  updateFull(
    @Param('lessonId', new ParseUUIDPipe({ version: '4' })) lessonId: string,
    @Param('subjectId', new ParseUUIDPipe({ version: '4' })) subjectId: string,
    @Body() updateSubjectPutDto: UpdateSubjectPutDto,
  ) {
    return this.subjectService.updateFull(
      lessonId,
      subjectId,
      updateSubjectPutDto,
    );
  }

  @Patch(':subjectId')
  updatePartial(
    @Param('lessonId', new ParseUUIDPipe({ version: '4' })) lessonId: string,
    @Param('subjectId', new ParseUUIDPipe({ version: '4' })) subjectId: string,
    @Body() updateSubjectPatchDto: UpdateSubjectPatchDto,
  ) {
    return this.subjectService.updatePartial(
      lessonId,
      subjectId,
      updateSubjectPatchDto,
    );
  }

  @Delete(':subjectId')
  remove(
    @Param('lessonId', new ParseUUIDPipe({ version: '4' })) lessonId: string,
    @Param('subjectId', new ParseUUIDPipe({ version: '4' })) subjectId: string,
  ) {
    return this.subjectService.remove(lessonId, subjectId);
  }
}
