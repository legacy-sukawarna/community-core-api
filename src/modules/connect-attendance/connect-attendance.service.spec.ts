import { Test, TestingModule } from '@nestjs/testing';
import { ConnectAttendanceService } from './connect-attendance.service';

describe('ConnectAttendanceService', () => {
  let service: ConnectAttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectAttendanceService],
    }).compile();

    service = module.get<ConnectAttendanceService>(ConnectAttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
