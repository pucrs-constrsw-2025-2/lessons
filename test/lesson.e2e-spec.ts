import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('LessonController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let roomId: string;
  let classId: string;
  let lessonId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up previous test data
    await prisma.subject.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.room.deleteMany();
    await prisma.class.deleteMany();

    // Create dependencies
    const room = await prisma.room.create({ data: {} });
    const classEntity = await prisma.class.create({ data: {} });
    roomId = room.id;
    classId = classEntity.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /lessons -> should create a new lesson', async () => {
    const createLessonDto = {
      sequence: 1,
      date: new Date().toISOString(),
      roomId,
      classId,
    };

    return request(app.getHttpServer())
      .post('/lessons')
      .send(createLessonDto)
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.sequence).toEqual(createLessonDto.sequence);
        lessonId = res.body.id;
      });
  });

  it('GET /lessons -> should return all lessons', () => {
    return request(app.getHttpServer())
      .get('/lessons')
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('GET /lessons/:id -> should return a specific lesson', () => {
    return request(app.getHttpServer())
      .get(`/lessons/${lessonId}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('id', lessonId);
      });
  });

  it('PATCH /lessons/:id -> should partially update a lesson', () => {
    const updatePayload = { sequence: 2 };
    return request(app.getHttpServer())
      .patch(`/lessons/${lessonId}`)
      .send(updatePayload)
      .expect(200)
      .then((res) => {
        expect(res.body.sequence).toEqual(updatePayload.sequence);
      });
  });

  it('PUT /lessons/:id -> should fully update a lesson', () => {
    const updatePayload = {
      sequence: 3,
      date: new Date().toISOString(),
      roomId,
      classId,
    };
    return request(app.getHttpServer())
      .put(`/lessons/${lessonId}`)
      .send(updatePayload)
      .expect(200)
      .then((res) => {
        expect(res.body.sequence).toEqual(updatePayload.sequence);
      });
  });

  it('DELETE /lessons/:id -> should delete a lesson', async () => {
    await request(app.getHttpServer()).delete(`/lessons/${lessonId}`).expect(200);

    // Verify it's gone
    return request(app.getHttpServer()).get(`/lessons/${lessonId}`).expect(404);
  });
});
