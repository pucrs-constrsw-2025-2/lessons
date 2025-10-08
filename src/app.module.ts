import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LessonModule } from './lesson/lesson.module';

@Module({
  imports: [PrismaModule, LessonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
