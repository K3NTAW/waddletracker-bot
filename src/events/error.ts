import { Client, Events } from 'discord.js';
import logger from '../utils/logger';

export function handleError(client: Client): void {
  client.on(Events.Error, (error) => {
    logger.error('Discord client error:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}
