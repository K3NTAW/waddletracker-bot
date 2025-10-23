import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import express from 'express';
import { config } from './config';
import logger from './utils/logger';
import { InteractionHandler } from './events/interaction-handler';
import { handleReady } from './events/ready';
import { handleError } from './events/error';
import { SchedulerService } from './services/scheduler';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Initialize services
const interactionHandler = new InteractionHandler();
const scheduler = new SchedulerService(client);

// Set up event handlers
handleReady(client);
handleError(client);

// Create Express app for health checks
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    bot: client.user?.tag || 'Not connected'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'WaddleTracker Discord Bot is running!',
    status: 'online',
    commands: 10
  });
});

// Start Express server
app.listen(PORT, () => {
  logger.info(`Health check server running on port ${PORT}`);
});

// Handle interactions
client.on(Events.InteractionCreate, async (interaction) => {
  await interactionHandler.handleInteraction(interaction);
});

// Handle client errors
client.on(Events.Error, (error) => {
  logger.error('Client error:', error);
});

// Handle process errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  scheduler.stop();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  scheduler.stop();
  client.destroy();
  process.exit(0);
});

// Login to Discord
client.login(config.discordToken).then(() => {
  // Start scheduler after successful login
  scheduler.start();
}).catch((error) => {
  logger.error('Failed to login:', error);
  process.exit(1);
});

export default client;
