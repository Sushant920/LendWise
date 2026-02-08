import { IsEnum, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { LoanType } from '@prisma/client';

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(LoanType)
  loanType?: LoanType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  requestedAmount?: number;

  /** Founders CIBIL score (typically 300–900). */
  @IsOptional()
  @IsNumber()
  @Min(300)
  @Max(900)
  @Type(() => Number)
  foundersCibilScore?: number;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  businessAgeMonths?: number;

  /** Not collected in form; derived from bank statement extraction. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyRevenue?: number;
}
