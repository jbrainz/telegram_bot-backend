import { Controller, Post, Body } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('user')
export class AuthController {
  constructor(private readonly userService: AuthService) {}

  @Post('')
  async signUp(
    @Body()
    createUserDto: UserDto,
  ) {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Post('verify')
  async verify(@Body() { token }: { token: string }) {
    return this.userService.verifyToken(token);
  }
}
