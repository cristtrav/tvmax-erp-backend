import { Test, TestingModule } from '@nestjs/testing';
import { BarriosController } from './barrios.controller';

describe('BarriosController', () => {
  let controller: BarriosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarriosController],
    }).compile();

    controller = module.get<BarriosController>(BarriosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
