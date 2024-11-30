import { Test, TestingModule } from '@nestjs/testing';
import { ConnectGroupService } from './connect-group.service';

describe('ConnectGroupService', () => {
  let service: ConnectGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectGroupService],
    }).compile();

    service = module.get<ConnectGroupService>(ConnectGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
