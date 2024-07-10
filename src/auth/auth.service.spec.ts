import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './auth.user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { hashUtils } from '../utils/hashPassword';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('createUser', () => {
    it('should successfully create a new user', async () => {
      const userDto = {
        telegramId: '123',
        fullName: 'Test User',
        password: 'password123',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);
      jest
        .spyOn(userRepository, 'save')
        .mockImplementation(async (user) => user as any);
      jest.spyOn(hashUtils, 'hash').mockReturnValue('hashedPassword');
      jest.spyOn(jwtService, 'sign').mockReturnValue('signedToken');

      const result = await service.createUser(userDto);
      console.log(result);
      expect(result).toEqual({
        success: true,
        message: 'User created',
        token: 'signedToken',
      });
    });

    it('should return an error if user already exists', async () => {
      const userDto = {
        telegramId: '123',
        fullName: 'Test User',
        password: 'password123',
      };
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ id: 1, ...userDto });

      const result = await service.createUser(userDto);

      expect(result).toEqual({
        success: false,
        message: 'User already exists',
        token: null,
      });
    });
  });
  describe('validateUser', () => {
    it('should return success if user is found and password matches', async () => {
      const user = {
        id: 1,
        telegramId: '123',
        fullName: 'Test User',
        password: 'hashedPassword',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(hashUtils, 'hash').mockReturnValue('hashedPassword');

      const result = await service.validateUser('123', 'password123');

      expect(result).toEqual({
        success: true,
        message: 'User found',
        user,
      });
    });

    it('should return failure if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      const result = await service.validateUser('123', 'password123');

      expect(result).toEqual({
        success: false,
        message: 'User not found',
        user: null,
      });
    });

    it('should return failure if password does not match', async () => {
      const user = {
        id: 1,
        telegramId: '123',
        fullName: 'Test User',
        password: 'hashedPassword',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(hashUtils, 'hash').mockReturnValue('differentHashedPassword');

      const result = await service.validateUser('123', 'wrongPassword');

      expect(result).toEqual({
        success: false,
        message: 'Invalid credentials',
        user: null,
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce({
        success: false,
        message: 'Invalid credentials',
        user: null,
      });

      await expect(
        service.login({
          telegramId: '123',
          password: 'password123',
          token: 'token',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce({
        success: true,
        message: 'User found',
        user: {
          id: 1,
          telegramId: '123',
          fullName: 'Test User',
          password: 'hashedPassword',
        },
      });
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error();
      });

      await expect(
        service.login({
          telegramId: '123',
          password: 'password123',
          token: 'invalidToken',
        }),
      ).rejects.toThrow('Invalid token');
    });

    it('should return valid true if user and token are valid', async () => {
      const user = {
        id: 1,
        telegramId: '123',
        fullName: 'Test User',
        password: 'hashedPassword',
      };
      jest.spyOn(service, 'validateUser').mockResolvedValueOnce({
        success: true,
        message: 'User found',
        user,
      });
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        fullName: 'Test User',
        sub: '123',
      });

      const result = await service.login({
        telegramId: '123',
        password: 'password123',
        token: 'validToken',
      });

      expect(result).toEqual({ valid: true, user });
    });
  });
});
