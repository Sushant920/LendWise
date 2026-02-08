import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { Role } from '@prisma/client';

@Controller('calculate-score')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post()
  async calculate(
    @User() user: RequestUser,
    @Body('applicationId') applicationId: string,
  ) {
    if (!applicationId) throw new BadRequestException('applicationId is required');
    return this.scoringService.calculateScore(applicationId, user.id);
  }
}
