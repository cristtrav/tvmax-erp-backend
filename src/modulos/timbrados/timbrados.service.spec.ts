import { Test, TestingModule } from '@nestjs/testing';
import { TimbradosService } from './timbrados.service';

describe('TimbradosService', () => {
  let service: TimbradosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimbradosService],
    }).compile();

    service = module.get<TimbradosService>(TimbradosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
