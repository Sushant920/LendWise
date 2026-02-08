import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum LoanTypeDto {
  working_capital = 'working_capital',
  term_loan = 'term_loan',
}

export class CreateApplicationDto {
  @IsEnum(LoanTypeDto)
  loanType: LoanTypeDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  requestedAmount?: number;
}
