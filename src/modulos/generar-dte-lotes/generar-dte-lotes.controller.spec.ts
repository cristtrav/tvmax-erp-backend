import { Test, TestingModule } from '@nestjs/testing';
import { GenerarDteLotesController } from './generar-dte-lotes.controller';

describe('GenerarDteLotesController', () => {
  let controller: GenerarDteLotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenerarDteLotesController],
    }).compile();

    controller = module.get<GenerarDteLotesController>(GenerarDteLotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
