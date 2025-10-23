import dotenv from 'dotenv';
import { BotConfig } from '../types';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DISCORD_TOKEN',
  'GUILD_ID',
  'API_BASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: BotConfig = {
  discordToken: process.env.DISCORD_TOKEN!,
  guildId: process.env.GUILD_ID!,
  apiBaseUrl: process.env.API_BASE_URL!,
  channelGymPics: process.env.CHANNEL_GYM_PICS || '',
  channelGeneral: process.env.CHANNEL_GENERAL || '',
  logLevel: process.env.LOG_LEVEL || 'info'
};

export default config;
