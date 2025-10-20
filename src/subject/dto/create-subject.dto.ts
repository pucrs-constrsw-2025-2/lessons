import { IsInt, IsString, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  description: string;

  @IsInt()
  credits: number;

  @IsUUID()
  lessonId: string;
}
