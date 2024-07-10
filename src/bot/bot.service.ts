import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as TelegramBot from 'node-telegram-bot-api';
import { BotUser } from './bot.user.entity';
import { config } from '../config/default';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(
    @InjectRepository(BotUser)
    private usersRepository: Repository<BotUser>,
  ) {
    this.initializeBot();
  }

  private initializeBot(): void {
    const token = config.telegramToken.botToken;
    if (!token) {
      throw new Error(
        'TELEGRAM_BOT_TOKEN is not defined in your environment variables',
      );
    }
    this.bot = new TelegramBot(token, { polling: true });
  }

  private async handleNewUser(
    telegramId: string,
    fullName: string,
  ): Promise<void> {
    const existingUser = await this.usersRepository.findOne({
      where: { telegramId },
    });

    if (!existingUser) {
      await this.usersRepository.save({
        telegramId,
        fullName,
      });
    }
  }

  async onModuleInit() {
    this.bot.onText(/\/start/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name;
        await this.handleNewUser(msg.from.id.toString(), firstName);
        this.bot.sendMessage(chatId, `Welcome ${firstName}!`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Open Web App',
                  web_app: {
                    url: `https://svelte-test-bay-eight.vercel.app/?firstname=${firstName}`,
                  },
                },
              ],
            ],
          },
        });
      } catch (error) {
        console.error('Error handling /start command:', error);
      }
    });

    this.bot.onText(/\/adminhello (\d+)(?: (.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const adminId = msg.from.id;

      const isAdmin = this.isUserAdmin(
        await this.findUserByTelegramId(adminId.toString()),
      );

      if (!isAdmin) {
        this.sendMessage(chatId, 'You are not authorized to use this command.');
        return;
      }

      const userId = match[1];
      const message = match[2];

      this.bot.sendMessage(
        userId,
        `Hello from admin!\n\n${message ?? 'Welcome to the app!'}`,
      );
    });

    this.bot.onText(/\/adminapprove/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;

      const adminUsers = await this.usersRepository.find({
        where: { isAdmin: true },
      });

      for (const user of adminUsers) {
        this.bot.sendMessage(
          user.telegramId,
          `User request admin approval telegramId:${telegramId}`,
        );
      }

      this.bot.sendMessage(chatId, 'Admins have been notified');
    });

    this.bot.onText(/\/approve (\d+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id.toString();
      const userId = match[1];

      await this.approveUser(chatId, telegramId, userId);
    });

    this.bot.on('message', (msg) => {
      const validCommands = ['/start', '/adminapprove', '/approve'];
      if (msg.text.startsWith('/')) {
        // Send a message listing valid commands
        const command = msg.text.split(' ')[0];
        if (!validCommands.includes(command)) {
          this.bot.sendMessage(
            msg.chat.id,
            `Valid commands are:
            - /start: Start interacting with the bot
            - /admin [userId] [message]: Send a message to a user as an admin
            - /adminapprove: Request admin approval
            - /approve [userId]: Approve a user as admin
            Please use a valid command.`,
          );
        }
        return;
      }

      // Handle other messages
      this.bot.sendMessage(
        msg.chat.id,
        `I'm sorry, I don't understand that command. Please use a valid command.
          - /start: Start interacting with the bot
          - /admin [userId] [message]: Send a message to a user as an admin
          - /adminapprove: Request admin approval
          - /approve [userId]: Approve a user as admin
        `,
      );
    });
  }

  async approveUser(chatId: number, telegramId: string, userId: string) {
    try {
      const admin = await this.findUserByTelegramId(telegramId);
      if (!this.isUserAdmin(admin)) {
        return this.sendMessage(
          chatId,
          'You are not authorized to use this command',
        );
      }

      const user = await this.findUserByTelegramId(userId);
      if (!user) {
        return this.sendMessage(chatId, 'User not found');
      }

      await this.setAdminStatus(user, true);
      this.sendMessage(chatId, 'User has been approved');
    } catch (error) {
      console.error('Error approving user:', error);
      this.sendMessage(
        chatId,
        'An error occurred while processing your request',
      );
    }
  }

  private async findUserByTelegramId(telegramId: string) {
    return this.usersRepository.findOne({ where: { telegramId } });
  }

  private isUserAdmin(user: BotUser): boolean {
    return user?.isAdmin;
  }

  private async setAdminStatus(user: BotUser, isAdmin: boolean) {
    user.isAdmin = isAdmin;
    await this.usersRepository.save(user);
  }

  private sendMessage(chatId: number, message: string) {
    this.bot.sendMessage(chatId, message);
  }
}
