import { Test, TestingModule } from '@nestjs/testing';
import { ConnectAttendanceController } from './connect-attendance.controller';

describe('ConnectAttendanceController', () => {
  let controller: ConnectAttendanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectAttendanceController],
    }).compile();

    controller = module.get<ConnectAttendanceController>(
      ConnectAttendanceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
