import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectPatchDto } from './dto/update-subject-patch.dto';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Get()
  findAll() {
    return this.subjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubjectPatchDto: UpdateSubjectPatchDto,
  ) {
    return this.subjectService.update(id, updateSubjectPatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(id);
  }
}
