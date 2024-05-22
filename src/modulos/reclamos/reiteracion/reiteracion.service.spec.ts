import { Test, TestingModule } from '@nestjs/testing';
import { ReiteracionService } from './reiteracion.service';

describe('ReiteracionService', () => {
  let service: ReiteracionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReiteracionService],
    }).compile();

    service = module.get<ReiteracionService>(ReiteracionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
