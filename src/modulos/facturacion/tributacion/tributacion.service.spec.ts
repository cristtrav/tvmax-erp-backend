import { Test, TestingModule } from '@nestjs/testing';
import { TributacionService } from './tributacion.service';

describe('TributacionService', () => {
  let service: TributacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TributacionService],
    }).compile();

    service = module.get<TributacionService>(TributacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
