import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, handleApiError, createPaginationButtons } from './index';
import { apiClient } from '../../services/api-client';

export class LeaderboardHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {

      const subcommand = interaction.options.getSubcommand();
      const limit = interaction.options.getInteger('limit') || 10;
      const page = 1; // For now, we'll implement pagination later

      let embed: EmbedBuilder;
      let title: string;
      let description: string;

      try {
        if (subcommand === 'streaks') {
          const type = interaction.options.getString('type') || 'current';
          
          // Get real leaderboard data from API
          const leaderboardData = await apiClient.getStreakLeaderboard(limit, type as 'current' | 'longest');
          
          embed = new EmbedBuilder()
            .setColor(leaderboardData.embed.color || 0xff6b35)
            .setTitle(leaderboardData.embed.title || `🔥 ${type === 'current' ? 'Current' : 'Longest'} Streak Leaderboard`)
            .setDescription(leaderboardData.embed.description || 'No data available')
            .setFooter(leaderboardData.embed.footer || { text: `Showing top ${limit} users` })
            .setTimestamp();

          // Add fields if they exist
          if (leaderboardData.embed.fields) {
            embed.addFields(leaderboardData.embed.fields);
          }

        } else if (subcommand === 'checkins') {
          const period = interaction.options.getString('period') || 'all';
          
          // Get real leaderboard data from API
          const leaderboardData = await apiClient.getCheckInLeaderboard(limit, period as 'all' | 'week' | 'month' | 'year');
          
          embed = new EmbedBuilder()
            .setColor(leaderboardData.embed.color || 0x00ff00)
            .setTitle(leaderboardData.embed.title || `📊 Check-in Leaderboard`)
            .setDescription(leaderboardData.embed.description || 'No data available')
            .setFooter(leaderboardData.embed.footer || { text: `Showing top ${limit} users` })
            .setTimestamp();

          // Add fields if they exist
          if (leaderboardData.embed.fields) {
            embed.addFields(leaderboardData.embed.fields);
          }
        } else {
          throw new Error('Invalid subcommand');
        }
      } catch (apiError) {
        // If API fails, show registration prompt
        embed = new EmbedBuilder()
          .setColor(0xffa500)
          .setTitle('🔐 Registration Required')
          .setDescription(
            `To view leaderboards, users need to register with WaddleTracker first.\n` +
            `Visit [waddletracker.com](https://waddletracker.com) to create an account and link your Discord profile.`
          )
          .addFields({
            name: '🔗 How to Get Started',
            value: '1. Visit [waddletracker.com](https://waddletracker.com)\n2. Sign up with Discord\n3. Link your Discord account\n4. Start tracking and competing!',
            inline: false
          })
          .setTimestamp();
      }

      // Add pagination buttons if there are multiple pages
      const totalPages = 1; // For now, we'll implement pagination later
      const components = totalPages > 1 ? createPaginationButtons(page, totalPages) : [];

      await interaction.editReply({
        embeds: [embed],
        components
      });

      // TODO: In a real implementation, you would:
      // 1. Call the appropriate API endpoint based on subcommand
      // 2. Use the returned leaderboard data and embed
      // 3. Implement proper pagination
      // 4. Handle cases where no data is available

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
