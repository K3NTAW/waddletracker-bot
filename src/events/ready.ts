import { Client, Events, ActivityType } from 'discord.js';
import logger from '../utils/logger';

export function handleReady(client: Client): void {
  client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Bot is ready! Logged in as ${readyClient.user.tag}`);
    
    // Set bot activity
    client.user?.setActivity('WaddleTracker - /help for commands', {
      type: ActivityType.Playing
    });

    // Log bot information
    logger.info(`Bot ID: ${readyClient.user.id}`);
    logger.info(`Guilds: ${readyClient.guilds.cache.size}`);
    logger.info(`Users: ${readyClient.users.cache.size}`);
  });
}
