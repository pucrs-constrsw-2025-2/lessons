import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthMiddleware } from '../src/middleware/auth.middleware';

describe('LessonController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let roomId: string;
  let classId: string;
  let lessonId: string;
  let secondLessonId: string;
  const originalFetch = global.fetch;

  // Mock token válido
  const validToken = 'Bearer valid-test-token';
  const invalidToken = 'Bearer invalid-token';

  beforeAll(async () => {
    // Configurar DATABASE_URL se não estiver definida
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_lessons';
    }
    
    // Mock fetch para autenticação
    global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
      const authHeader = options?.headers?.Authorization;
      
      // Simular validação de token
      if (authHeader === validToken) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ sub: 'test-user', active: true }),
        } as unknown as Response);
      }
      
      // Token inválido
      return Promise.resolve({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ error: 'Invalid token' }),
      } as unknown as Response);
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    // Configurar prefixo global como no main.ts
    app.setGlobalPrefix('api/v1', {
      exclude: ['health'],
    });
    
    // Aplicar middleware de autenticação (mesmo do main.ts)
    const authMiddleware = new AuthMiddleware();
    app.use(async (req, res, next) => {
      if ((req.path === '/' || req.path === '/health') && req.method === 'GET') {
        return next();
      }
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Missing bearer token',
          error: 'Unauthorized',
        });
      }
      
      try {
        await authMiddleware.use(req, res, next);
      } catch (error: any) {
        const status = error.getStatus ? error.getStatus() : 401;
        const message = error.message || 'Unauthorized';
        return res.status(status).json({
          statusCode: status,
          message: message,
          error: error.name || 'Unauthorized',
        });
      }
    });
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up previous test data
    await prisma.subject.deleteMany();
    await prisma.lesson.deleteMany();

    // Create dependencies (roomId and classId are external references, using UUIDs)
    // For testing purposes, we'll use valid UUIDs (v4 format)
    roomId = '550e8400-e29b-41d4-a716-446655440000';
    classId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  });

  afterAll(async () => {
    global.fetch = originalFetch;
    await app.close();
  });

  describe('POST /api/v1/lessons', () => {
    it('should return 201 Created when lesson is created successfully', async () => {
      const createLessonDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .set('Authorization', validToken)
        .send(createLessonDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.sequence).toEqual(createLessonDto.sequence);
      expect(response.body.date).toBeDefined();
      expect(response.body.roomId).toEqual(roomId);
      expect(response.body.classId).toEqual(classId);
      lessonId = response.body.id;
    });

    it('should return 400 Bad Request when validation fails (missing required fields)', async () => {
      const invalidDto = {
        sequence: 1,
        // date, roomId, classId missing
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .set('Authorization', validToken)
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 Bad Request when validation fails (invalid types)', async () => {
      const invalidDto = {
        sequence: 'invalid',
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .set('Authorization', validToken)
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 Bad Request when validation fails (invalid UUID)', async () => {
      const invalidDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId: 'invalid-uuid',
        classId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .set('Authorization', validToken)
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const createLessonDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .send(createLessonDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toContain('Missing bearer token');
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const createLessonDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .set('Authorization', invalidToken)
        .send(createLessonDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 409 Conflict when sequence and date already exist', async () => {
      const existingDate = new Date().toISOString();
      
      // Criar primeira lesson
      await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .set('Authorization', validToken)
        .send({
          sequence: 10,
          date: existingDate,
          roomId,
          classId,
        })
        .expect(201);

      // Tentar criar outra com mesmo sequence e date
      const response = await request(app.getHttpServer())
        .post('/api/v1/lessons')
        .set('Authorization', validToken)
        .send({
          sequence: 10,
          date: existingDate,
          roomId,
          classId,
        })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('sequence and date already exists');
    });
  });

  describe('GET /api/v1/lessons', () => {
    it('should return 200 OK with array of lessons', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lessons')
        .set('Authorization', validToken)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('sequence');
      expect(response.body[0]).toHaveProperty('date');
    });

    it('should return 204 No Content when no lessons found', async () => {
      // Limpar todas as lessons
      await prisma.lesson.deleteMany();

      const response = await request(app.getHttpServer())
        .get('/api/v1/lessons')
        .set('Authorization', validToken)
        .expect(204);

      expect(response.body).toEqual({});

      // Recriar uma lesson para outros testes
      const lesson = await prisma.lesson.create({
        data: {
          sequence: 1,
          date: new Date(),
          roomId,
          classId,
        },
      });
      lessonId = lesson.id;
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lessons')
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toContain('Missing bearer token');
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lessons')
        .set('Authorization', invalidToken)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/lessons/:id', () => {
    it('should return 200 OK with lesson when found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toHaveProperty('id', lessonId);
      expect(response.body).toHaveProperty('sequence');
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('roomId');
      expect(response.body).toHaveProperty('classId');
    });

    it('should return 400 Bad Request when UUID is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/lessons/invalid-uuid')
        .set('Authorization', validToken)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/lessons/${lessonId}`)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toContain('Missing bearer token');
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', invalidToken)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 404 Not Found when lesson does not exist', async () => {
      // Use a valid UUID v4 that doesn't exist in the database
      const nonExistentId = 'e57720b0-dece-4729-936c-ac43e42d25fd';
      
      const response = await request(app.getHttpServer())
        .get(`/api/v1/lessons/${nonExistentId}`)
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/v1/lessons/:id', () => {
    it('should return 200 OK when lesson is updated successfully', async () => {
      const updateDto = {
        sequence: 5,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', validToken)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toBe(lessonId);
      expect(response.body.sequence).toBe(updateDto.sequence);
      expect(response.body.roomId).toBe(roomId);
      expect(response.body.classId).toBe(classId);
    });

    it('should return 400 Bad Request when validation fails (missing required fields)', async () => {
      const invalidDto = {
        sequence: 1,
        // date, roomId, classId missing
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', validToken)
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 Bad Request when UUID is invalid', async () => {
      const updateDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .put('/api/v1/lessons/invalid-uuid')
        .set('Authorization', validToken)
        .send(updateDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const updateDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/lessons/${lessonId}`)
        .send(updateDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const updateDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', invalidToken)
        .send(updateDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 404 Not Found when lesson does not exist', async () => {
      // Use a valid UUID v4 that doesn't exist in the database
      const nonExistentId = 'e57720b0-dece-4729-936c-ac43e42d25fd';
      const updateDto = {
        sequence: 1,
        date: new Date().toISOString(),
        roomId,
        classId,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/lessons/${nonExistentId}`)
        .set('Authorization', validToken)
        .send(updateDto)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 409 Conflict when sequence and date conflict with another lesson', async () => {
      // Criar segunda lesson
      const secondLesson = await prisma.lesson.create({
        data: {
          sequence: 20,
          date: new Date(),
          roomId,
          classId,
        },
      });
      secondLessonId = secondLesson.id;

      // Tentar atualizar primeira lesson com sequence e date da segunda
      const conflictDate = new Date(secondLesson.date).toISOString();
      const response = await request(app.getHttpServer())
        .put(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', validToken)
        .send({
          sequence: 20,
          date: conflictDate,
          roomId,
          classId,
        })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('sequence and date already exists');
    });
  });

  describe('PATCH /api/v1/lessons/:id', () => {
    it('should return 200 OK when lesson is partially updated successfully', async () => {
      const updateDto = { sequence: 6 };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', validToken)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toBe(lessonId);
      expect(response.body.sequence).toBe(updateDto.sequence);
    });

    it('should return 400 Bad Request when validation fails (invalid type)', async () => {
      const invalidDto = { sequence: 'invalid' };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', validToken)
        .send(invalidDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 Bad Request when UUID is invalid', async () => {
      const updateDto = { sequence: 1 };

      const response = await request(app.getHttpServer())
        .patch('/api/v1/lessons/invalid-uuid')
        .set('Authorization', validToken)
        .send(updateDto)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const updateDto = { sequence: 1 };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/lessons/${lessonId}`)
        .send(updateDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const updateDto = { sequence: 1 };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', invalidToken)
        .send(updateDto)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 404 Not Found when lesson does not exist', async () => {
      const nonExistentId = 'e57720b0-dece-4729-936c-ac43e42d25fd';
      const updateDto = { sequence: 1 };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/lessons/${nonExistentId}`)
        .set('Authorization', validToken)
        .send(updateDto)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should return 409 Conflict when sequence and date conflict with another lesson', async () => {
      // Usar a segunda lesson criada anteriormente
      const secondLesson = await prisma.lesson.findUnique({
        where: { id: secondLessonId },
      });

      if (secondLesson) {
        const conflictDate = new Date(secondLesson.date).toISOString();
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/lessons/${lessonId}`)
          .set('Authorization', validToken)
          .send({
            sequence: 20,
            date: conflictDate,
          })
          .expect(409);

        expect(response.body.statusCode).toBe(409);
        expect(response.body.message).toContain('sequence and date already exists');
      }
    });
  });

  describe('DELETE /api/v1/lessons/:id', () => {
    it('should return 200 OK when lesson is deleted successfully', async () => {
      // Criar uma lesson para deletar
      const lessonToDelete = await prisma.lesson.create({
        data: {
          sequence: 99,
          date: new Date(),
          roomId,
          classId,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/lessons/${lessonToDelete.id}`)
        .set('Authorization', validToken)
        .expect(200);

      expect(response.body).toHaveProperty('id', lessonToDelete.id);

      // Verificar que foi deletada
      await request(app.getHttpServer())
        .get(`/api/v1/lessons/${lessonToDelete.id}`)
        .set('Authorization', validToken)
        .expect(404);
    });

    it('should return 400 Bad Request when UUID is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/lessons/invalid-uuid')
        .set('Authorization', validToken)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/lessons/${lessonId}`)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
      expect(response.body.message).toContain('Missing bearer token');
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/lessons/${lessonId}`)
        .set('Authorization', invalidToken)
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('should return 404 Not Found when lesson does not exist', async () => {
      const nonExistentId = 'e57720b0-dece-4729-936c-ac43e42d25fd';

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/lessons/${nonExistentId}`)
        .set('Authorization', validToken)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });
});
