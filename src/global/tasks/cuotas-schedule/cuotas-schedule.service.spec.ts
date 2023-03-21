import { Test, TestingModule } from '@nestjs/testing';
import { CuotasScheduleService } from './cuotas-schedule.service';

describe('CuotasScheduleService', () => {
  let service: CuotasScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuotasScheduleService],
    }).compile();

    service = module.get<CuotasScheduleService>(CuotasScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
