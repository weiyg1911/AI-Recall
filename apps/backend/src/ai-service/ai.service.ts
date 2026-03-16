import { ChatDeepSeek } from '@langchain/deepseek';
import { Injectable } from '@nestjs/common';
import configuration from 'src/common/config/configuration';

@Injectable()
export class AIService {
  constructor() {}

  getDSModal(temperature: number = 0.7, maxTokens: number = 4000) {
    return new ChatDeepSeek({
      apiKey: configuration().aiModal.apiKey,
      temperature,
      maxTokens,
      model: 'deepseek-chat',
    });
  }
}
