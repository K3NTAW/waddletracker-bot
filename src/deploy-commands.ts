import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import { commands } from './commands/registry';
import logger from './utils/logger';

// Convert commands to JSON format
const commandData = commands.map(command => command.toJSON());

// Create REST instance
const rest = new REST({ version: '10' }).setToken(config.discordToken);

// Deploy commands
async function deployCommands() {
  try {
    logger.info(`Started refreshing ${commandData.length} application (/) commands.`);

    // Create a client to get the application ID
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    
    await client.login(config.discordToken);
    
    // Get the application ID from the client
    const applicationId = client.application?.id;
    
    if (!applicationId) {
      throw new Error('Could not get application ID from bot token');
    }
    
    // Clean the guild ID (remove any non-numeric characters)
    const guildId = config.guildId.replace(/[^0-9]/g, '');
    
    logger.info(`Application ID: ${applicationId}`);
    logger.info(`Guild ID: ${guildId}`);
    
    // Register commands for the guild
    const data = await rest.put(
      Routes.applicationGuildCommands(applicationId, guildId),
      { body: commandData }
    ) as any[];

    logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
    
    // Destroy the client
    client.destroy();
  } catch (error) {
    logger.error('Error deploying commands:', error);
  }
}

// Run deployment
deployCommands();
