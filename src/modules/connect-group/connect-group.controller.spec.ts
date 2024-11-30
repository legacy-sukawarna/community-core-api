import { Test, TestingModule } from '@nestjs/testing';
import { ConnectGroupController } from './connect-group.controller';

describe('ConnectGroupController', () => {
  let controller: ConnectGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectGroupController],
    }).compile();

    controller = module.get<ConnectGroupController>(ConnectGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
