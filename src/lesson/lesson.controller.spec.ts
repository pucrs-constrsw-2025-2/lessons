import { Test, TestingModule } from '@nestjs/testing';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { ConflictException, NotFoundException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('LessonController', () => {
  let controller: LessonController;
  let service: LessonService;

  const mockLesson = {
    id: '7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f',
    sequence: 1,
    date: new Date('2025-10-27T10:00:00.000Z'),
    roomId: 'e2c3a5b6-d7e8-9f01-2345-6789abcd0123',
    classId: 'a1b2c3d4-e5f6-7890-1234-5678abcd9012',
  };

  const mockCreateLessonDto = {
    sequence: 1,
    date: '2025-10-27T10:00:00Z',
    roomId: 'e2c3a5b6-d7e8-9f01-2345-6789abcd0123',
    classId: 'a1b2c3d4-e5f6-7890-1234-5678abcd9012',
  };

  const mockLessonService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateFull: jest.fn(),
    updatePartial: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonController],
      providers: [
        {
          provide: LessonService,
          useValue: mockLessonService,
        },
      ],
    }).compile();

    controller = module.get<LessonController>(LessonController);
    service = module.get<LessonService>(LessonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/lessons', () => {
    it('should return 201 Created when lesson is created successfully', async () => {
      mockLessonService.create.mockResolvedValue(mockLesson);

      const result = await controller.create(mockCreateLessonDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateLessonDto);
      expect(result).toEqual(mockLesson);
    });

    // Note: ValidationPipe and ParseUUIDPipe are tested in e2e tests
    // Unit tests focus on controller logic and service integration

    it('should return 409 Conflict when sequence and date already exist', async () => {
      const conflictError = new ConflictException(
        'A lesson with the same sequence and date already exists',
      );
      mockLessonService.create.mockRejectedValue(conflictError);

      await expect(controller.create(mockCreateLessonDto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.create).toHaveBeenCalledWith(mockCreateLessonDto);
    });
  });

  describe('GET /api/v1/lessons', () => {
    it('should return 200 OK with array of lessons', async () => {
      const lessons = [mockLesson, { ...mockLesson, id: 'another-id' }];
      mockLessonService.findAll.mockResolvedValue(lessons);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(lessons);
    });

    it('should return 204 No Content when no lessons found', async () => {
      mockLessonService.findAll.mockResolvedValue([]);

      await expect(controller.findAll()).rejects.toThrow();
      
      try {
        await controller.findAll();
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NO_CONTENT);
      }
    });
  });

  describe('GET /api/v1/lessons/:id', () => {
    const lessonId = '7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f';

    it('should return 200 OK with lesson when found', async () => {
      mockLessonService.findOne.mockResolvedValue(mockLesson);

      const result = await controller.findOne(lessonId);

      expect(service.findOne).toHaveBeenCalledWith(lessonId);
      expect(result).toEqual(mockLesson);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when lesson does not exist', async () => {
      mockLessonService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(lessonId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(lessonId);
    });
  });

  describe('PUT /api/v1/lessons/:id', () => {
    const lessonId = '7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f';
    const updateDto = {
      sequence: 2,
      date: '2025-10-28T10:00:00Z',
      roomId: 'e2c3a5b6-d7e8-9f01-2345-6789abcd0123',
      classId: 'a1b2c3d4-e5f6-7890-1234-5678abcd9012',
    };

    it('should return 200 OK when lesson is updated successfully', async () => {
      const updatedLesson = { ...mockLesson, ...updateDto };
      mockLessonService.updateFull.mockResolvedValue(updatedLesson);

      const result = await controller.updateFull(lessonId, updateDto);

      expect(service.updateFull).toHaveBeenCalledWith(lessonId, updateDto);
      expect(result).toEqual(updatedLesson);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when lesson does not exist', async () => {
      const notFoundError = new NotFoundException(`Lesson with ID ${lessonId} not found`);
      mockLessonService.updateFull.mockRejectedValue(notFoundError);

      await expect(controller.updateFull(lessonId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return 409 Conflict when sequence and date conflict', async () => {
      const conflictError = new ConflictException(
        'A lesson with the same sequence and date already exists',
      );
      mockLessonService.updateFull.mockRejectedValue(conflictError);

      await expect(controller.updateFull(lessonId, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('PATCH /api/v1/lessons/:id', () => {
    const lessonId = '7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f';
    const updateDto = { sequence: 2 };

    it('should return 200 OK when lesson is partially updated successfully', async () => {
      const updatedLesson = { ...mockLesson, sequence: 2 };
      mockLessonService.updatePartial.mockResolvedValue(updatedLesson);

      const result = await controller.updatePartial(lessonId, updateDto);

      expect(service.updatePartial).toHaveBeenCalledWith(lessonId, updateDto);
      expect(result).toEqual(updatedLesson);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when lesson does not exist', async () => {
      const notFoundError = new NotFoundException(`Lesson with ID ${lessonId} not found`);
      mockLessonService.updatePartial.mockRejectedValue(notFoundError);

      await expect(controller.updatePartial(lessonId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return 409 Conflict when sequence and date conflict', async () => {
      const conflictError = new ConflictException(
        'A lesson with the same sequence and date already exists',
      );
      mockLessonService.updatePartial.mockRejectedValue(conflictError);

      await expect(controller.updatePartial(lessonId, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('DELETE /api/v1/lessons/:id', () => {
    const lessonId = '7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f';

    it('should return 200 OK when lesson is deleted successfully', async () => {
      mockLessonService.remove.mockResolvedValue(mockLesson);

      const result = await controller.remove(lessonId);

      expect(service.remove).toHaveBeenCalledWith(lessonId);
      expect(result).toEqual(mockLesson);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when lesson does not exist', async () => {
      const notFoundError = new NotFoundException(`Lesson with ID ${lessonId} not found`);
      mockLessonService.remove.mockRejectedValue(notFoundError);

      await expect(controller.remove(lessonId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

