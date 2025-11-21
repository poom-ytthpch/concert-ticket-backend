import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../..//common/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let mockPrismaService = {
    concert: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const mockBullQueue: any = {
    add: jest.fn(),
    process: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('reservations'),
          useValue: mockBullQueue,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
});
