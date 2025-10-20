import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LessonModule } from './lesson/lesson.module';
import { SubjectModule } from './subject/subject.module';

@Module({
  imports: [PrismaModule, LessonModule, SubjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
