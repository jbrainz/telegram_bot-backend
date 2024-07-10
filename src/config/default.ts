import { DatabaseType } from 'typeorm';
import type { Config } from '.';
import { getEnvironmentValue } from '.';

export const config: Config = {
  server: {
    port: Number(getEnvironmentValue('PORT', '4000')),
  },
  db: {
    type: getEnvironmentValue('DB_TYPE', '') as DatabaseType,
    url: getEnvironmentValue('DB_URL', ''),
  },
  jwt: {
    secret: getEnvironmentValue('JWT_SECRET', ''),
  },
  telegramToken: {
    botToken: getEnvironmentValue('TELEGRAM_BOT_TOKEN', ''),
  },
};
