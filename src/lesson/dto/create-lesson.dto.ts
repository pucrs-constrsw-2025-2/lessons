import { IsDateString, IsInt, IsUUID } from 'class-validator';

export class CreateLessonDto {
  @IsInt()
  sequence: number;

  @IsDateString()
  date: string;

  @IsUUID()
  roomId: string;

  @IsUUID()
  classId: string;
}
