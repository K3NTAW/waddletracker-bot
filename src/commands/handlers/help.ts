import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { CommandHandler, createInfoEmbed, handleApiError } from './index';

export class HelpHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const command = interaction.options.getString('command');

      if (command) {
        // Show help for specific command
        const helpText = this.getCommandHelp(command);
        const embed = createInfoEmbed(
          `Help: /${command}`,
          helpText
        );

        await interaction.editReply({ embeds: [embed] });
      } else {
        // Show general help
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('🤖 WaddleTracker Bot Help')
          .setDescription('Here are all the available commands:')
          .addFields(
            {
              name: '🏋️ Core Commands',
              value: '`/checkin` - Log your gym check-in\n`/profile` - View user profile and stats\n`/cheer` - Send encouragement to another user\n`/streak` - View streak information',
              inline: false
            },
            {
              name: '📊 Advanced Commands',
              value: '`/leaderboard` - View streak and check-in leaderboards\n`/schedule` - Manage your gym schedule\n`/gallery` - View user photo gallery\n`/notifications` - Manage your notifications\n`/analytics` - View your analytics and stats',
              inline: false
            },
            {
              name: '❓ Help',
              value: '`/help [command]` - Get help with specific commands',
              inline: false
            }
          )
          .addFields(
            {
              name: '🔗 Quick Links',
              value: '[Website](https://waddletracker.com) • [Support](https://discord.gg/waddletracker) • [GitHub](https://github.com/waddletracker)',
              inline: false
            }
          )
          .setFooter({ text: 'Use /help [command] for detailed information about a specific command' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }

  private getCommandHelp(command: string): string {
    const helpTexts: Record<string, string> = {
      checkin: `**Description:** Log your gym check-in\n\n**Usage:** \`/checkin status:<went|missed> [photo_url]\`\n\n**Options:**\n• \`status\` - Whether you went to the gym or missed your workout\n• \`photo_url\` - Optional URL of your gym photo\n\n**Examples:**\n• \`/checkin status:went\`\n• \`/checkin status:went photo_url:https://example.com/photo.jpg\``,
      
      profile: `**Description:** View user profile and stats\n\n**Usage:** \`/profile [user]\`\n\n**Options:**\n• \`user\` - User to view profile for (defaults to yourself)\n\n**Examples:**\n• \`/profile\` - View your own profile\n• \`/profile @username\` - View another user's profile`,
      
      cheer: `**Description:** Send encouragement to another user\n\n**Usage:** \`/cheer user:<@user> message:<text>\`\n\n**Options:**\n• \`user\` - User to cheer for (required)\n• \`message\` - Your encouraging message (3-500 characters)\n\n**Examples:**\n• \`/cheer user:@username message:Great job on your streak! 💪\``,
      
      streak: `**Description:** View streak information\n\n**Usage:** \`/streak [user]\`\n\n**Options:**\n• \`user\` - User to view streak for (defaults to yourself)\n\n**Examples:**\n• \`/streak\` - View your own streak\n• \`/streak @username\` - View another user's streak`,
      
      leaderboard: `**Description:** View leaderboards\n\n**Usage:** \`/leaderboard <streaks|checkins> [options]\`\n\n**Subcommands:**\n• \`streaks\` - View streak leaderboard\n• \`checkins\` - View check-in leaderboard\n\n**Options:**\n• \`type\` - Type of streak leaderboard (current/longest)\n• \`period\` - Time period for check-in leaderboard (all/week/month/year)\n• \`limit\` - Number of users to show (1-50)\n\n**Examples:**\n• \`/leaderboard streaks type:current limit:10\`\n• \`/leaderboard checkins period:week limit:5\``,
      
      schedule: `**Description:** Manage your gym schedule\n\n**Usage:** \`/schedule <set|view|delete>\`\n\n**Subcommands:**\n• \`set\` - Set your gym schedule\n• \`view\` - View your current schedule\n• \`delete\` - Delete your schedule\n\n**Options for 'set':**\n• \`days\` - Days of the week (comma-separated)\n• \`time\` - Time in 24-hour format\n\n**Examples:**\n• \`/schedule set days:Monday,Wednesday,Friday time:18:00\`\n• \`/schedule view\``,
      
      gallery: `**Description:** View user photo gallery\n\n**Usage:** \`/gallery [user] [options]\`\n\n**Options:**\n• \`user\` - User to view gallery for (defaults to yourself)\n• \`status\` - Filter by check-in status (all/went/missed)\n• \`page\` - Page number (default: 1)\n• \`limit\` - Photos per page (1-20)\n\n**Examples:**\n• \`/gallery\` - View your own gallery\n• \`/gallery @username status:went page:2\``,
      
      notifications: `**Description:** Manage your notifications\n\n**Usage:** \`/notifications <view|mark_read>\`\n\n**Subcommands:**\n• \`view\` - View your notifications\n• \`mark_read\` - Mark notifications as read\n\n**Options for 'view':**\n• \`type\` - Filter by notification type\n• \`unread_only\` - Show only unread notifications\n• \`page\` - Page number\n\n**Examples:**\n• \`/notifications view type:cheer unread_only:true\`\n• \`/notifications mark_read\``,
      
      analytics: `**Description:** View your analytics and stats\n\n**Usage:** \`/analytics [period]\`\n\n**Options:**\n• \`period\` - Number of days to analyze (1-365, default: 30)\n\n**Examples:**\n• \`/analytics\` - View last 30 days\n• \`/analytics period:90\` - View last 90 days`
    };

    return helpTexts[command] || 'Command not found. Use `/help` to see all available commands.';
  }
}
