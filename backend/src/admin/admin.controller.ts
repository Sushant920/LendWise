import { Controller, Get, Param, Query, UseGuards, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
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
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.adminService.getApplications({ status, loanType, dateFrom, dateTo });
  }

  @Get('applications/export')
  async exportApplications(
    @Query('status') status?: string,
    @Query('loanType') loanType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<StreamableFile> {
    const csv = await this.adminService.getApplicationsCsv({
      status,
      loanType,
      dateFrom,
      dateTo,
    });
    const stream = Readable.from([csv]);
    return new StreamableFile(stream, {
      type: 'text/csv',
      disposition: 'attachment; filename="applications.csv"',
    });
  }

  @Get('applications/:id')
  getApplicationDetail(@Param('id') id: string) {
    return this.adminService.getApplicationDetail(id);
  }

  @Get('documents/:id/download')
  async downloadDocument(@Param('id') id: string): Promise<StreamableFile> {
    const { absolutePath, fileName, mimeType } =
      await this.adminService.getDocumentDownload(id);
    const stream = createReadStream(absolutePath);
    return new StreamableFile(stream, {
      type: mimeType,
      disposition: `attachment; filename="${fileName.replace(/"/g, '\\"')}"`,
    });
  }
}
