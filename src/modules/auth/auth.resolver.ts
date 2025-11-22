import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import {
  RegisterInput,
  RegisterResponse,
  RegisterUserInput,
  RegisterUserResponse,
} from 'src/types/gql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth-guard';
import { Roles } from 'src/common/jwt/roles.decorator';
import { RoleType } from '@prisma/client';
import { GqlContext } from '@/types/gql-context';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.ADMIN, RoleType.ROOT)
  @Mutation('register')
  register(
    @Args('input') input: RegisterInput,
    @Context() ctx: GqlContext,
  ): Promise<RegisterResponse> {
    return this.authService.register(input, ctx);
  }

  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.ROOT)
  @Mutation('login')
  login(@Args('input') input: RegisterInput): Promise<RegisterResponse> {
    return this.authService.login(input);
  }

  @Mutation('registerUser')
  registerUser(
    @Args('input') input: RegisterUserInput,
  ): Promise<RegisterUserResponse> {
    return this.authService.registerUser(input);
  }
}
