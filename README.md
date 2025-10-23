# WaddleTracker Discord Bot

A Discord bot for WaddleTracker - a gym accountability app that syncs with a backend API. The bot handles check-ins, streaks, cheers, and user profiles with rich Discord embeds.

## 🚀 Features

### Core Commands
- `/checkin` - Log your gym check-in (went/missed) with optional photos
- `/profile` - View user profile and stats
- `/cheer` - Send encouragement to another user
- `/streak` - View streak information

### Advanced Commands
- `/leaderboard` - View streak and check-in leaderboards
- `/schedule` - Manage your gym schedule with automated reminders
- `/gallery` - View user photo gallery with filtering
- `/notifications` - Manage your notifications
- `/analytics` - View your analytics and stats

### Interactive Features
- Rich Discord embeds for all commands
- Button interactions for confirmations
- Modal forms for complex inputs
- Pagination for large data sets
- Automated reminders and notifications

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- Discord Bot Token
- WaddleTracker Backend API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd waddletracker-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   GUILD_ID=your_discord_server_id_here
   API_BASE_URL=https://waddletracker-backend.vercel.app/api
   CHANNEL_GYM_PICS=channel_id_for_gym_pics
   CHANNEL_GENERAL=channel_id_for_general
   LOG_LEVEL=info
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy slash commands**
   ```bash
   npm run deploy-commands
   ```

6. **Start the bot**
   ```bash
   npm start
   ```

### Development

For development with auto-reload:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | Yes |
| `GUILD_ID` | Discord server ID | Yes |
| `API_BASE_URL` | Backend API URL | Yes |
| `CHANNEL_GYM_PICS` | Channel for gym photos | No |
| `CHANNEL_GENERAL` | General channel | No |
| `LOG_LEVEL` | Logging level | No |

### Bot Permissions

The bot requires the following permissions:
- Send Messages
- Embed Links
- Attach Files
- Use Slash Commands
- Read Message History
- Add Reactions

## 📚 API Integration

The bot integrates with the WaddleTracker backend API:

- **Authentication**: Discord OAuth2 + JWT tokens
- **Endpoints**: 24+ endpoints for user management, check-ins, streaks, etc.
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting**: Built-in rate limiting for API calls

### API Endpoints Used

- `GET /api/users/:id` - Get user profile
- `POST /api/checkins` - Create check-in
- `GET /api/streak/:userId` - Get streak data
- `POST /api/cheers` - Send cheer
- `GET /api/leaderboard/*` - Get leaderboards
- And many more...

## 🎯 Command Examples

### Check-in
```
/checkin status:went photo_url:https://example.com/gym-photo.jpg
```

### Profile
```
/profile @username
```

### Cheer
```
/cheer user:@username message:Great job on your streak! 💪
```

### Leaderboard
```
/leaderboard streaks type:current limit:10
```

### Schedule
```
/schedule set days:Monday,Wednesday,Friday time:18:00
```

## 🏗️ Architecture

### Project Structure
```
src/
├── commands/           # Slash commands and handlers
│   ├── handlers/       # Individual command handlers
│   ├── slash-commands.ts
│   └── registry.ts
├── events/             # Discord event handlers
├── services/           # API client and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── config/             # Configuration management
└── index.ts           # Main bot file
```

### Key Components

- **Command Handlers**: Individual classes for each command
- **API Client**: Centralized API communication
- **Interaction Handler**: Manages buttons, modals, and slash commands
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging with Winston

## 🔒 Security

- Environment variables for sensitive data
- Input validation and sanitization
- Rate limiting for API calls
- Error handling without exposing internals
- JWT token management for API authentication

## 🚀 Deployment

### Production Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set up environment variables** in your production environment

3. **Deploy slash commands**
   ```bash
   npm run deploy-commands
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["npm", "start"]
```

## 📝 Development Notes

### Adding New Commands

1. Create command in `src/commands/slash-commands.ts`
2. Create handler in `src/commands/handlers/`
3. Register in `src/commands/registry.ts`
4. Deploy with `npm run deploy-commands`

### API Integration

The bot currently uses mock data for demonstration. To integrate with the real API:

1. Implement Discord OAuth2 flow for user authentication
2. Store JWT tokens securely
3. Replace mock data with actual API calls
4. Handle authentication errors gracefully

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Discord: [WaddleTracker Server](https://discord.gg/waddletracker)
- GitHub Issues: [Report bugs or request features](https://github.com/waddletracker/discord-bot/issues)
- Documentation: [WaddleTracker Docs](https://docs.waddletracker.com)

## 🔄 Changelog

### v1.0.0
- Initial release
- Core commands implementation
- API client setup
- Interactive components
- Error handling
- Logging system
# waddletracker-bot
