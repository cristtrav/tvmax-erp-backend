import { Test, TestingModule } from '@nestjs/testing';
import { TimbradosTasksService } from './timbrados-tasks.service';

describe('TimbradosTasksService', () => {
  let service: TimbradosTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimbradosTasksService],
    }).compile();

    service = module.get<TimbradosTasksService>(TimbradosTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
