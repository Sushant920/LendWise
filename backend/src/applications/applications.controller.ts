import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { Role } from '@prisma/client';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@User() user: RequestUser, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(user.id, dto);
  }

  @Get()
  findAll(@User() user: RequestUser) {
    return this.applicationsService.findAllByMerchant(user.id);
  }

  @Get(':id')
  findOne(@User() user: RequestUser, @Param('id') id: string) {
    return this.applicationsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @User() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, user.id, dto);
  }

  @Post(':id/submit')
  submit(@User() user: RequestUser, @Param('id') id: string) {
    return this.applicationsService.submit(id, user.id);
  }
}
