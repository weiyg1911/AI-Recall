import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './specs/openapi.json',
  output: './src/generated',
  client: 'fetch',
  useOptions: true,
});
