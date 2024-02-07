import { Test, TestingModule } from '@nestjs/testing';
import { MotivosController } from './motivos.controller';

describe('MotivosController', () => {
  let controller: MotivosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotivosController],
    }).compile();

    controller = module.get<MotivosController>(MotivosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
