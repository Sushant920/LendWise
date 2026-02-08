import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { LendersService } from './lenders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { Role } from '@prisma/client';

@Controller('evaluate-lenders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class LendersEvaluateController {
  constructor(private readonly lendersService: LendersService) {}

  @Post()
  async evaluate(
    @User() user: RequestUser,
    @Body('applicationId') applicationId: string,
  ) {
    if (!applicationId) throw new BadRequestException('applicationId is required');
    return this.lendersService.evaluateLenders(applicationId, user.id);
  }
}

@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class OffersController {
  constructor(private readonly lendersService: LendersService) {}

  @Get()
  async getOffers(
    @User() user: RequestUser,
    @Query('applicationId') applicationId: string,
  ) {
    if (!applicationId) throw new BadRequestException('applicationId is required');
    return this.lendersService.getOffers(applicationId, user.id);
  }
}

@Controller('decision-explanation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class DecisionExplanationController {
  constructor(private readonly lendersService: LendersService) {}

  @Get()
  async getExplanation(
    @User() user: RequestUser,
    @Query('applicationId') applicationId: string,
  ) {
    if (!applicationId) throw new BadRequestException('applicationId is required');
    return this.lendersService.getDecisionExplanation(applicationId, user.id);
  }
}
