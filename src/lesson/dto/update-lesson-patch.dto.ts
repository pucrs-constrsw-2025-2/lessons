import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';

export class UpdateLessonPatchDto extends PartialType(CreateLessonDto) {}
