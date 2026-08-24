import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            cartItem: {
              findMany: jest.fn(),
              upsert: jest.fn(),
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            product: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            order: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
            user: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
