import { IsInt, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  description: string;

  @IsInt()
  credits: number;
}
