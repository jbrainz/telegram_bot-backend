import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}
