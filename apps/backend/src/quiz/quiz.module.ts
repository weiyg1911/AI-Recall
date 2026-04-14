import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';

@Module({
  imports: [],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
