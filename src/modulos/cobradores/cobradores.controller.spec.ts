import { Test, TestingModule } from '@nestjs/testing';
import { CobradoresController } from './cobradores.controller';

describe('CobradoresController', () => {
  let controller: CobradoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CobradoresController],
    }).compile();

    controller = module.get<CobradoresController>(CobradoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
