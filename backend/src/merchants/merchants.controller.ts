import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { Role } from '@prisma/client';

@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('me')
  getProfile(@User() user: RequestUser) {
    return this.merchantsService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@User() user: RequestUser, @Body() dto: UpdateMerchantDto) {
    return this.merchantsService.updateProfile(user.id, dto);
  }
}
