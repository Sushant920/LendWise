import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User, RequestUser } from '../auth/user.decorator';
import { Role } from '@prisma/client';
import { DocumentType } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${unique}${ext}`);
  },
});

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.merchant)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @User() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('applicationId') applicationId: string,
    @Body('type') type: string,
  ) {
    return this.doUpload(user, file, applicationId, type);
  }

  @Post('upload-documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadDocuments(
    @User() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('applicationId') applicationId: string,
    @Body('type') type: string,
  ) {
    return this.doUpload(user, file, applicationId, type);
  }

  private doUpload(
    user: RequestUser,
    file: Express.Multer.File,
    applicationId: string,
    type: string,
  ) {
    if (!applicationId) throw new BadRequestException('applicationId is required');
    if (!type || !['bank_statement', 'gst_return'].includes(type)) {
      throw new BadRequestException('type must be bank_statement or gst_return');
    }
    if (!file) throw new BadRequestException('file is required');
    return this.documentsService.upload(
      user.id,
      applicationId,
      type as DocumentType,
      file,
    );
  }

  @Get('application/:applicationId')
  listByApplication(
    @User() user: RequestUser,
    @Param('applicationId') applicationId: string,
  ) {
    return this.documentsService.listByApplication(applicationId, user.id);
  }
}
