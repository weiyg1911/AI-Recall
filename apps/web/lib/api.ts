import { createAppClient } from '@memorize/api-client';

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

export const apiClient = createAppClient(baseUrl);
