import { Test, TestingModule } from '@nestjs/testing';
import { MotivosService } from './motivos.service';

describe('MotivosService', () => {
  let service: MotivosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotivosService],
    }).compile();

    service = module.get<MotivosService>(MotivosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
