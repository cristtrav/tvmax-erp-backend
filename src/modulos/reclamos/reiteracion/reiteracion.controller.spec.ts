import { Test, TestingModule } from '@nestjs/testing';
import { ReiteracionController } from './reiteracion.controller';

describe('ReiteracionController', () => {
  let controller: ReiteracionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReiteracionController],
    }).compile();

    controller = module.get<ReiteracionController>(ReiteracionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
