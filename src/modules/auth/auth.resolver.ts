import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterInput, RegisterResponse } from 'src/types/gql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth-guard';
import { Roles } from 'src/common/jwt/roles.decorator';
import { RoleType } from '@prisma/client';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.ADMIN, RoleType.ROOT)
  @Mutation('register')
  register(@Args('input') input: RegisterInput): Promise<RegisterResponse> {
    return this.authService.register(input);
  }

  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.ROOT)
  @Mutation('login')
  login(@Args('input') input: RegisterInput): Promise<RegisterResponse> {
    return this.authService.login(input);
  }
}
