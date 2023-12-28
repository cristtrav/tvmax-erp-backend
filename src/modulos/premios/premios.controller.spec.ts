import { Test, TestingModule } from '@nestjs/testing';
import { PremiosController } from './premios.controller';

describe('PremiosController', () => {
  let controller: PremiosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PremiosController],
    }).compile();

    controller = module.get<PremiosController>(PremiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
