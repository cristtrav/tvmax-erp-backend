import { Test, TestingModule } from '@nestjs/testing';
import { TributacionController } from './tributacion.controller';

describe('TributacionController', () => {
  let controller: TributacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TributacionController],
    }).compile();

    controller = module.get<TributacionController>(TributacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
