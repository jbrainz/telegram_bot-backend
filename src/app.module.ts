import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { AuthModule } from './auth/auth.module';
import { config } from './config/default';
import { User } from './auth/auth.user.entity';
import { BotUser } from './bot/bot.user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: config.db.type,
      url: config.db.url,
      synchronize: true,
      entities: [User, BotUser],
    }),
    BotModule,
    AuthModule,
  ],
})
export class AppModule {}
