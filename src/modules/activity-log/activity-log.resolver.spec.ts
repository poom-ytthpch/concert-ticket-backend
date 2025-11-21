import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogResolver } from './activity-log.resolver';
import { ActivityLogService } from './activity-log.service';

describe('ActivityLogResolver', () => {
  let resolver: ActivityLogResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityLogResolver, ActivityLogService],
    }).compile();

    resolver = module.get<ActivityLogResolver>(ActivityLogResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
