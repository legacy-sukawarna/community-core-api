import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

describe('UserService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should upsert a user', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MEMBER',
    } as User;
    jest.spyOn(prismaService.user, 'upsert').mockResolvedValue(mockUser);

    const result = await userService.insertUser(mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should find a user by ID', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'MEMBER',
    } as User;
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const result = await userService.findUserById('1');
    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException if user not found by ID', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(userService.findUserById('2')).rejects.toThrow(
      'User with ID 2 not found',
    );
  });
});
