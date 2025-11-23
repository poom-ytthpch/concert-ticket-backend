import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { ActivityLogService } from './activity-log.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/jwt/jwt-auth-guard';
import { Roles } from '@/common/jwt/roles.decorator';
import { RoleType } from '@prisma/client';
import { ActivityLogGql, ActivityLogsInput } from '@/types/gql';
import { GqlContext } from '@/types/gql-context';

@Resolver('ActivityLog')
export class ActivityLogResolver {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.ADMIN)
  @Query('activityLogs')
  async activityLogs(
    @Args('input') input: ActivityLogsInput,
    @Context() ctx: GqlContext,
  ): Promise<ActivityLogGql[]> {
    return await this.activityLogService.findAll(input, ctx);
  }
}
