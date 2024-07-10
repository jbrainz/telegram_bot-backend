import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BotUser } from './bot.user.entity';

describe('BotService', () => {
  let service: BotService;
  let mockUsersRepository;
  let mockBot;

  beforeEach(async () => {
    mockUsersRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockBot = {
      sendMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        {
          provide: getRepositoryToken(BotUser),
          useValue: mockUsersRepository,
        },
        {
          provide: 'TELEGRAM_BOT',
          useValue: mockBot,
        },
      ],
    }).compile();

    service = module.get<BotService>(BotService);
    service['bot'] = mockBot; // Assuming bot is a private property, we need to override it this way.
  });

  it('should not approve user if requester is not admin', async () => {
    mockUsersRepository.findOne.mockResolvedValueOnce({ isAdmin: false });

    await service.approveUser(123, 'requesterId', 'userId');

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      123,
      'You are not authorized to use this command',
    );
  });

  it('should send "User not found" if user to be approved does not exist', async () => {
    mockUsersRepository.findOne
      .mockResolvedValueOnce({ isAdmin: true }) // Requester is admin
      .mockResolvedValueOnce(null); // User to be approved does not exist

    await service.approveUser(123, 'adminId', 'nonExistentUserId');

    expect(mockBot.sendMessage).toHaveBeenCalledWith(123, 'User not found');
  });

  it('should approve user and send confirmation', async () => {
    const userToBeApproved = { telegramId: 'userId', isAdmin: false };
    mockUsersRepository.findOne
      .mockResolvedValueOnce({ isAdmin: true }) // Requester is admin
      .mockResolvedValueOnce(userToBeApproved); // User to be approved exists

    await service.approveUser(123, 'adminId', 'userId');

    expect(mockUsersRepository.save).toHaveBeenCalledWith({
      ...userToBeApproved,
      isAdmin: true,
    });
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      123,
      'User has been approved',
    );
  });
});
