import { Module } from '@nestjs/common';
import { LendersService } from './lenders.service';
import {
  LendersEvaluateController,
  OffersController,
  DecisionExplanationController,
} from './lenders.controller';

@Module({
  controllers: [
    LendersEvaluateController,
    OffersController,
    DecisionExplanationController,
  ],
  providers: [LendersService],
  exports: [LendersService],
})
export class LendersModule {}
