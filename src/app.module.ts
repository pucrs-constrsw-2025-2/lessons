import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LessonModule } from './lesson/lesson.module';
import { SubjectModule } from './subject/subject.module';
import { HealthController, PrismaHealthIndicator } from './health.controller';

@Module({
  imports: [TerminusModule, PrismaModule, LessonModule, SubjectModule],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaHealthIndicator],
})
export class AppModule {}
