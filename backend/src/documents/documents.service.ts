import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    merchantId: string,
    applicationId: string,
    type: DocumentType,
    file: Express.Multer.File,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) {
      throw new ForbiddenException('Not allowed to add documents to this application');
    }
    if (application.status !== 'draft') {
      throw new BadRequestException('Can only add documents to draft applications');
    }
    if (!file || !file.path) {
      throw new BadRequestException('File is required');
    }
    if (file.size > MAX_FILE_SIZE) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('File size exceeds 10MB limit');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Allowed types: PDF, JPEG, PNG, WebP');
    }

    const relativePath = path.relative(UPLOAD_DIR, file.path);
    const doc = await this.prisma.document.create({
      data: {
        applicationId,
        type,
        storagePath: relativePath,
        fileName: file.originalname || file.filename || 'document',
        mimeType: file.mimetype,
      },
    });
    return { id: doc.id, type: doc.type, fileName: doc.fileName };
  }

  async listByApplication(applicationId: string, merchantId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { documents: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) {
      throw new ForbiddenException('Not allowed');
    }
    return application.documents.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      mimeType: d.mimeType,
      createdAt: d.createdAt,
    }));
  }
}
