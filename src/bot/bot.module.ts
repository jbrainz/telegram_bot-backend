import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotUser } from './bot.user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BotUser])],
  providers: [BotService],
})
export class BotModule {}
