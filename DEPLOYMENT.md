# WaddleTracker Discord Bot - Deployment Guide

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Discord Bot Token
- Discord Server ID
- WaddleTracker Backend API access

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd waddletracker-discord-bot

# Install dependencies
npm install

# Build the project
npm run build
```

### 3. Environment Setup

Create a `.env` file in the project root:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
GUILD_ID=your_discord_server_id_here

# API Configuration
API_BASE_URL=https://waddletracker-backend.vercel.app/api
NODE_ENV=production

# Channel Configuration (Optional)
CHANNEL_GYM_PICS=channel_id_for_gym_pics
CHANNEL_GENERAL=channel_id_for_general

# Bot Configuration
LOG_LEVEL=info
```

### 4. Deploy Slash Commands

```bash
# Deploy commands to your Discord server
npm run deploy-commands
```

### 5. Start the Bot

```bash
# Start the bot
npm start
```

## 🔧 Discord Bot Setup

### Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section
4. Click "Add Bot"
5. Copy the bot token and add it to your `.env` file

### Bot Permissions

The bot needs the following permissions:
- Send Messages
- Embed Links
- Attach Files
- Use Slash Commands
- Read Message History
- Add Reactions

### Inviting the Bot

1. Go to "OAuth2" > "URL Generator"
2. Select "bot" and "applications.commands" scopes
3. Select the required permissions
4. Copy the generated URL and use it to invite the bot

## 🏗️ Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot with PM2
pm2 start dist/index.js --name "waddletracker-bot"

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port (if needed)
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
# Build Docker image
docker build -t waddletracker-discord-bot .

# Run container
docker run -d --name waddletracker-bot --env-file .env waddletracker-discord-bot
```

### Using Systemd (Linux)

Create `/etc/systemd/system/waddletracker-bot.service`:

```ini
[Unit]
Description=WaddleTracker Discord Bot
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/waddletracker-discord-bot
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable waddletracker-bot
sudo systemctl start waddletracker-bot
```

## 🔍 Monitoring

### Logs

The bot uses Winston for logging. Logs are written to:
- Console (all levels)
- `logs/error.log` (errors only)
- `logs/combined.log` (all levels)

### Health Checks

Create a simple health check endpoint:

```typescript
// Add to src/index.ts
import express from 'express';

const app = express();
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(3000, () => {
  logger.info('Health check server running on port 3000');
});
```

### Monitoring with PM2

```bash
# View logs
pm2 logs waddletracker-bot

# Monitor resources
pm2 monit

# Restart bot
pm2 restart waddletracker-bot

# Stop bot
pm2 stop waddletracker-bot
```

## 🔒 Security

### Environment Variables

- Never commit `.env` files
- Use environment-specific configuration
- Rotate tokens regularly
- Use secrets management in production

### Bot Security

- Use least privilege principle for bot permissions
- Monitor bot activity and logs
- Implement rate limiting
- Validate all user inputs

### API Security

- Use HTTPS for all API calls
- Implement proper authentication
- Validate API responses
- Handle errors gracefully

## 🚨 Troubleshooting

### Common Issues

1. **Bot not responding to commands**
   - Check if commands are deployed: `npm run deploy-commands`
   - Verify bot has proper permissions
   - Check logs for errors

2. **API connection issues**
   - Verify `API_BASE_URL` is correct
   - Check network connectivity
   - Verify API is running

3. **Permission errors**
   - Ensure bot has required permissions
   - Check channel permissions
   - Verify bot is in the correct server

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
```

### Log Analysis

```bash
# View recent errors
tail -f logs/error.log

# Search for specific errors
grep "ERROR" logs/combined.log

# Monitor real-time logs
pm2 logs waddletracker-bot --lines 100
```

## 📊 Performance

### Optimization

- Use connection pooling for database connections
- Implement caching for frequently accessed data
- Monitor memory usage
- Optimize API calls

### Scaling

- Use multiple bot instances with load balancing
- Implement horizontal scaling
- Monitor resource usage
- Use CDN for static assets

## 🔄 Updates

### Updating the Bot

1. Pull latest changes
2. Install new dependencies: `npm install`
3. Build the project: `npm run build`
4. Deploy new commands: `npm run deploy-commands`
5. Restart the bot: `pm2 restart waddletracker-bot`

### Rollback

```bash
# Stop current version
pm2 stop waddletracker-bot

# Switch to previous version
git checkout previous-version-tag
npm run build
pm2 start dist/index.js --name "waddletracker-bot"
```

## 📞 Support

- Discord: [WaddleTracker Server](https://discord.gg/waddletracker)
- GitHub Issues: [Report bugs](https://github.com/waddletracker/discord-bot/issues)
- Documentation: [WaddleTracker Docs](https://docs.waddletracker.com)

## 📝 Changelog

### v1.0.0
- Initial release
- Core commands implementation
- API client setup
- Interactive components
- Automated reminders
- Comprehensive error handling
