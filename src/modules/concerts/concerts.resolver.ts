import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ConcertsService } from './concerts.service';
import { CreateConcertInput, GetConcertsResponse } from '@/types/gql';
import { GqlContext } from '@/types/gql-context';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/jwt/jwt-auth-guard';
import { Roles } from '@/common/jwt/roles.decorator';
import { RoleType } from '@prisma/client';

@Resolver('Concert')
export class ConcertsResolver {
  constructor(private readonly concertsService: ConcertsService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.ADMIN)
  @Mutation('createConcert')
  createConcert(
    @Args('input') input: CreateConcertInput,
    @Context() ctx: GqlContext,
  ) {
    return this.concertsService.create(input, ctx);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.ADMIN)
  @Mutation('deleteConcert')
  deleteConcert(@Args('id') id: string) {
    return this.concertsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER, RoleType.ADMIN)
  @Query('getConcerts')
  getConcerts(@Context() ctx: GqlContext): Promise<GetConcertsResponse> {
    return this.concertsService.getConcerts(ctx);
  }
}
