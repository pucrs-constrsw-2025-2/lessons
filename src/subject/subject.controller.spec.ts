import { Test, TestingModule } from '@nestjs/testing';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { NotFoundException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('SubjectController', () => {
  let controller: SubjectController;
  let service: SubjectService;

  const mockLessonId = '7b1c3d5e-a2b3-4c5d-6e7f-8a9b0c1d2e3f';
  const mockSubject = {
    id: 'a0b1c2d3-e4f5-6789-0123-456789abcdef',
    description: 'Introdução à Programação',
    credits: 4,
    lessonId: mockLessonId,
  };

  const mockCreateSubjectDto = {
    description: 'Introdução à Programação',
    credits: 4,
  };

  const mockSubjectService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateFull: jest.fn(),
    updatePartial: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectController],
      providers: [
        {
          provide: SubjectService,
          useValue: mockSubjectService,
        },
      ],
    }).compile();

    controller = module.get<SubjectController>(SubjectController);
    service = module.get<SubjectService>(SubjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/lessons/:lessonId/subjects', () => {
    it('should return 201 Created when subject is created successfully', async () => {
      mockSubjectService.create.mockResolvedValue(mockSubject);

      const result = await controller.create(mockLessonId, mockCreateSubjectDto);

      expect(service.create).toHaveBeenCalledWith(mockLessonId, mockCreateSubjectDto);
      expect(result).toEqual(mockSubject);
    });

    // Note: ValidationPipe and ParseUUIDPipe are tested in e2e tests
    // Unit tests focus on controller logic and service integration

    it('should return 404 Not Found when lesson does not exist', async () => {
      const notFoundError = new NotFoundException(
        `Lesson with ID ${mockLessonId} not found`,
      );
      mockSubjectService.create.mockRejectedValue(notFoundError);

      await expect(controller.create(mockLessonId, mockCreateSubjectDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GET /api/v1/lessons/:lessonId/subjects', () => {
    it('should return 200 OK with array of subjects', async () => {
      const subjects = [
        mockSubject,
        { ...mockSubject, id: 'another-id', description: 'Estruturas de Dados', credits: 6 },
      ];
      mockSubjectService.findAll.mockResolvedValue(subjects);

      const result = await controller.findAll(mockLessonId);

      expect(service.findAll).toHaveBeenCalledWith(mockLessonId);
      expect(result).toEqual(subjects);
    });

    it('should return 204 No Content when no subjects found', async () => {
      mockSubjectService.findAll.mockResolvedValue([]);

      await expect(controller.findAll(mockLessonId)).rejects.toThrow();
      
      try {
        await controller.findAll(mockLessonId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NO_CONTENT);
      }
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when lesson does not exist', async () => {
      const notFoundError = new NotFoundException(
        `Lesson with ID ${mockLessonId} not found`,
      );
      mockSubjectService.findAll.mockRejectedValue(notFoundError);

      await expect(controller.findAll(mockLessonId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GET /api/v1/lessons/:lessonId/subjects/:subjectId', () => {
    const subjectId = 'a0b1c2d3-e4f5-6789-0123-456789abcdef';

    it('should return 200 OK with subject when found', async () => {
      mockSubjectService.findOne.mockResolvedValue(mockSubject);

      const result = await controller.findOne(mockLessonId, subjectId);

      expect(service.findOne).toHaveBeenCalledWith(mockLessonId, subjectId);
      expect(result).toEqual(mockSubject);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when subject does not exist', async () => {
      const notFoundError = new NotFoundException(
        `Subject with ID ${subjectId} not found in Lesson ${mockLessonId}`,
      );
      mockSubjectService.findOne.mockRejectedValue(notFoundError);

      await expect(controller.findOne(mockLessonId, subjectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PUT /api/v1/lessons/:lessonId/subjects/:subjectId', () => {
    const subjectId = 'a0b1c2d3-e4f5-6789-0123-456789abcdef';
    const updateDto = {
      description: 'Tópicos Avançados em Programação',
      credits: 8,
      lessonId: mockLessonId,
    };

    it('should return 200 OK when subject is updated successfully', async () => {
      const updatedSubject = { ...mockSubject, ...updateDto };
      mockSubjectService.updateFull.mockResolvedValue(updatedSubject);

      const result = await controller.updateFull(mockLessonId, subjectId, updateDto);

      expect(service.updateFull).toHaveBeenCalledWith(mockLessonId, subjectId, updateDto);
      expect(result).toEqual(updatedSubject);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when subject does not exist', async () => {
      const notFoundError = new NotFoundException(
        `Subject with ID ${subjectId} not found in Lesson ${mockLessonId}`,
      );
      mockSubjectService.updateFull.mockRejectedValue(notFoundError);

      await expect(controller.updateFull(mockLessonId, subjectId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('PATCH /api/v1/lessons/:lessonId/subjects/:subjectId', () => {
    const subjectId = 'a0b1c2d3-e4f5-6789-0123-456789abcdef';
    const updateDto = { credits: 6 };

    it('should return 200 OK when subject is partially updated successfully', async () => {
      const updatedSubject = { ...mockSubject, credits: 6 };
      mockSubjectService.updatePartial.mockResolvedValue(updatedSubject);

      const result = await controller.updatePartial(mockLessonId, subjectId, updateDto);

      expect(service.updatePartial).toHaveBeenCalledWith(mockLessonId, subjectId, updateDto);
      expect(result).toEqual(updatedSubject);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when subject does not exist', async () => {
      const notFoundError = new NotFoundException(
        `Subject with ID ${subjectId} not found in Lesson ${mockLessonId}`,
      );
      mockSubjectService.updatePartial.mockRejectedValue(notFoundError);

      await expect(controller.updatePartial(mockLessonId, subjectId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('DELETE /api/v1/lessons/:lessonId/subjects/:subjectId', () => {
    const subjectId = 'a0b1c2d3-e4f5-6789-0123-456789abcdef';

    it('should return 200 OK when subject is deleted successfully', async () => {
      mockSubjectService.remove.mockResolvedValue(mockSubject);

      const result = await controller.remove(mockLessonId, subjectId);

      expect(service.remove).toHaveBeenCalledWith(mockLessonId, subjectId);
      expect(result).toEqual(mockSubject);
    });

    // Note: ParseUUIDPipe validation is tested in e2e tests

    it('should return 404 Not Found when subject does not exist', async () => {
      const notFoundError = new NotFoundException(
        `Subject with ID ${subjectId} not found in Lesson ${mockLessonId}`,
      );
      mockSubjectService.remove.mockRejectedValue(notFoundError);

      await expect(controller.remove(mockLessonId, subjectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

