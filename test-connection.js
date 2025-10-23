const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log('✅ Bot is connected and ready!');
  console.log(`Bot ID: ${client.user.id}`);
  console.log(`Bot Username: ${client.user.username}`);
  console.log(`Guilds: ${client.guilds.cache.size}`);
  client.destroy();
});

client.on('error', (error) => {
  console.error('❌ Bot connection error:', error);
  process.exit(1);
});

console.log('🔄 Testing bot connection...');
client.login(process.env.DISCORD_TOKEN);
