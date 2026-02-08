import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { Role } from '@prisma/client';

@Controller('extract-financials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class ExtractionController {
  constructor(private readonly extractionService: ExtractionService) {}

  @Post()
  async extract(
    @User() user: RequestUser,
    @Body('applicationId') applicationId: string,
  ) {
    if (!applicationId) throw new BadRequestException('applicationId is required');
    return this.extractionService.extractForApplication(applicationId, user.id);
  }
}
