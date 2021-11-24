import { Test, TestingModule } from '@nestjs/testing';
import { TimbradosController } from './timbrados.controller';

describe('TimbradosController', () => {
  let controller: TimbradosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimbradosController],
    }).compile();

    controller = module.get<TimbradosController>(TimbradosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
