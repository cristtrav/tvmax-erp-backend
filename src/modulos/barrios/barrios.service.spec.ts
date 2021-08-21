import { Test, TestingModule } from '@nestjs/testing';
import { BarriosService } from './barrios.service';

describe('BarriosService', () => {
  let service: BarriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarriosService],
    }).compile();

    service = module.get<BarriosService>(BarriosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
