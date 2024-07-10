// eslint-disable-next-line
require('dotenv').config();
import { config as dotenvConfig } from 'dotenv';
import * as R from 'ramda';
import { DatabaseType } from 'typeorm';

dotenvConfig();

export interface Config {
  server: {
    port: number;
  };
  db: {
    type: DatabaseType;
    url: string;
  };
  jwt?: {
    secret: string;
  };
  telegramToken?: {
    botToken: string;
  };
}

export const getEnvironmentValue = (
  key: string,
  defaultValue?: string,
): string => {
  const envVal = process.env[key] ?? defaultValue;

  if (!envVal && envVal !== '') {
    throw new Error(`env variable ${key} has to be defined`);
  }

  return envVal;
};

/* eslint-disable */
const defaultConfig = require('./default').config;

export const config = R.mergeDeepRight(defaultConfig) as object as Config;
