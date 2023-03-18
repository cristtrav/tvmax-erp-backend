import { Test, TestingModule } from '@nestjs/testing';
import { CobranzaExternaController } from './cobranza-externa.controller';

describe('CobranzaExternaController', () => {
  let controller: CobranzaExternaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CobranzaExternaController],
    }).compile();

    controller = module.get<CobranzaExternaController>(CobranzaExternaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
