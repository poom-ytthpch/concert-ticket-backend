import { Job } from 'bullmq';
import { ActivityLogProcessor } from './activity-log.processor';

describe('ActivityLogProcessor', () => {
  let processor: ActivityLogProcessor;
  let mockactivityLogService: {
    create: jest.Mock;
  };

  beforeEach(() => {
    mockactivityLogService = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    processor = new ActivityLogProcessor(mockactivityLogService as any);
  });

  it('calls activityLogService.create and logs when job name is create-activity-log', async () => {
    const job = {
      name: 'create-activity-log',
      data: { userId: 'user-1', concertId: 'concert-1', action: 'joined' },
    } as unknown as Job<any>;

    const loggerSpy = jest.spyOn((processor as any).logger, 'log');

    const result = await processor.process(job);

    expect(mockactivityLogService.create).toHaveBeenCalledWith({
      userId: 'user-1',
      concertId: 'concert-1',
      action: 'joined',
    });
    expect(loggerSpy).toHaveBeenCalledWith('activityLog job', job);
    expect(result).toBe(true);

    loggerSpy.mockRestore();
  });

  it('does not call activityLogService.create when job name is different and still returns true', async () => {
    const job = {
      name: 'some-other-job',
      data: { userId: 'user-2', concertId: 'concert-2', action: 'left' },
    } as unknown as Job<any>;

    const loggerSpy = jest.spyOn((processor as any).logger, 'log');

    const result = await processor.process(job);

    expect(mockactivityLogService.create).not.toHaveBeenCalled();
    expect(loggerSpy).not.toHaveBeenCalled();
    expect(result).toBe(true);

    loggerSpy.mockRestore();
  });
});
