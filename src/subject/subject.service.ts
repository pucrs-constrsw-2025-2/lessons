import { Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectPatchDto } from './dto/update-subject-patch.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private prisma: PrismaService) {}

  create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: createSubjectDto });
  }

  findAll() {
    return this.prisma.subject.findMany();
  }

  findOne(id: string) {
    return this.prisma.subject.findUnique({ where: { id } });
  }

  update(id: string, updateSubjectDto: UpdateSubjectPatchDto) {
    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
    });
  }

  remove(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }
}
