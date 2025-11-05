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
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonPatchDto } from './dto/update-lesson-patch.dto';
import { UpdateLessonPutDto } from './dto/update-lesson-put.dto';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  async findAll() {
    const items = await this.lessonService.findAll();
    if (!items || items.length === 0) {
      throw new HttpException('', HttpStatus.NO_CONTENT);
    }
    return items;
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const lesson = await this.lessonService.findOne(id);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  @Put(':id')
  updateFull(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateLessonPutDto: UpdateLessonPutDto,
  ) {
    return this.lessonService.updateFull(id, updateLessonPutDto);
  }

  @Patch(':id')
  updatePartial(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateLessonPatchDto: UpdateLessonPatchDto,
  ) {
    return this.lessonService.updatePartial(id, updateLessonPatchDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.lessonService.remove(id);
  }


}
