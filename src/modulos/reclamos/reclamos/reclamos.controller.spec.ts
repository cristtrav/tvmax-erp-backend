import { Test, TestingModule } from '@nestjs/testing';
import { ReclamosController } from './reclamos.controller';

describe('ReclamosController', () => {
  let controller: ReclamosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamosController],
    }).compile();

    controller = module.get<ReclamosController>(ReclamosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
