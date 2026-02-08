import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('merchants')
  getMerchants(@Query('search') search?: string) {
    return this.adminService.getMerchants(search);
  }

  @Get('applications')
  getApplications(
    @Query('status') status?: string,
    @Query('loanType') loanType?: string,
  ) {
    return this.adminService.getApplications({ status, loanType });
  }

  @Get('applications/:id')
  getApplicationDetail(@Param('id') id: string) {
    return this.adminService.getApplicationDetail(id);
  }
}
