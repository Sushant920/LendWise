import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MerchantsModule } from './merchants/merchants.module';
import { ApplicationsModule } from './applications/applications.module';
import { DocumentsModule } from './documents/documents.module';
import { ExtractionModule } from './extraction/extraction.module';
import { ScoringModule } from './scoring/scoring.module';
import { LendersModule } from './lenders/lenders.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MerchantsModule,
    ApplicationsModule,
    DocumentsModule,
    ExtractionModule,
    ScoringModule,
    LendersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
