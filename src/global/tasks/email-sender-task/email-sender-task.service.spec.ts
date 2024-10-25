import { Test, TestingModule } from '@nestjs/testing';
import { EmailSenderTaskService } from './email-sender-task.service';

describe('EmailSenderTaskService', () => {
  let service: EmailSenderTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailSenderTaskService],
    }).compile();

    service = module.get<EmailSenderTaskService>(EmailSenderTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
