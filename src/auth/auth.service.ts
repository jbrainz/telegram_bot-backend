import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { hashUtils } from '../utils/hashPassword';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { config } from '../config/default';
import { User } from './auth.user.entity';

type CreateUserResponse = { success: boolean; message: string; token: string };
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(user: UserDto): Promise<CreateUserResponse> {
    const userExists = await this.findUser(user.telegramId);
    if (userExists && userExists.id) {
      return {
        success: false,
        message: 'User already exists',
        token: null,
      };
    }
    const hashedPassword = hashUtils.hash(user.password);
    user.password = hashedPassword;

    this.logger.debug(`Creating user ${user.fullName}`);
    await this.userRepository.save(user);
    return {
      success: true,
      message: 'User created',
      token: this.signToken(user),
    };
  }

  async getUser(telegramId: string): Promise<User> {
    return this.findUser(telegramId);
  }

  private async findUser(telegramId: string): Promise<User> {
    return await this.userRepository.findOne({ where: { telegramId } });
  }

  private signToken(user: UserDto): string {
    return this.jwtService.sign(
      {
        fullName: user.fullName,
        sub: user.telegramId,
      },
      { expiresIn: '30 days' },
    );
  }

  verifyToken(token: string): boolean {
    try {
      this.jwtService.verify(token, {
        secret: config.jwt.secret,
      });
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateUser(telegramId: string, password: string) {
    const user = await this.findUser(telegramId);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        user: null,
      };
    }
    if (user.password !== hashUtils.hash(password)) {
      this.logger.error(`Invalid credentials for user ${user.fullName}`);
      return {
        success: false,
        message: 'Invalid credentials',
        user: null,
      };
    }

    this.logger.debug(`User ${user.fullName} auth successful`);
    return {
      success: true,
      message: 'User found',
      user,
    };
  }

  async login(user: LoginDto) {
    const isValidUser = await this.validateUser(user.telegramId, user.password);

    if (!isValidUser.success) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidToken = this.verifyToken(user.token);

    if (!isValidToken) {
      throw new UnauthorizedException('Invalid token');
    }

    return { valid: true, user: isValidUser.user };
  }
}
