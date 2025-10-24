import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { CommandHandler, createErrorEmbed, handleApiError, getUserId } from './index';
import { apiClient } from '../../services/api-client';

export class AnalyticsHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {

      const userId = getUserId(interaction);
      const period = interaction.options.getInteger('period') || 30;

      try {
        // Get real analytics data from API
        const analyticsData = await apiClient.getUserAnalytics(userId, period);

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('📊 Your Analytics')
          .setDescription(`**Period:** Last ${period} days`)
          .addFields(
            {
              name: '📈 Overall Stats',
              value: `**Total Check-ins:** ${analyticsData.total_checkins}\n**Went to Gym:** ${analyticsData.went_count}\n**Missed:** ${analyticsData.missed_count}`,
              inline: true
            },
            {
              name: '🎯 Performance',
              value: `**Consistency Rate:** ${analyticsData.consistency_rate}%\n**Average Streak:** ${analyticsData.average_streak} days\n**Best Streak:** ${analyticsData.best_streak} days`,
              inline: true
            },
            {
              name: '📅 Weekly Breakdown',
              value: analyticsData.weekly_breakdown.map(day => 
                `${day.day}: ${day.count} check-ins`
              ).join('\n'),
              inline: false
            }
          )
          .setTimestamp();

        // Add trend analysis
        const recentTrend = analyticsData.checkin_trends.slice(-7);
        const trendText = recentTrend.map(trend => 
          `${trend.date}: ${trend.count} check-ins`
        ).join('\n');

        embed.addFields({
          name: '📊 Recent Trend (Last 7 Days)',
          value: trendText,
          inline: false
        });

        // Add motivational message based on consistency rate
        let motivation = '';
        if (analyticsData.consistency_rate >= 90) {
          motivation = '🏆 Outstanding! You\'re a fitness champion!';
        } else if (analyticsData.consistency_rate >= 75) {
          motivation = '💪 Great job! You\'re building a solid habit!';
        } else if (analyticsData.consistency_rate >= 50) {
          motivation = '👍 Good progress! Keep pushing forward!';
        } else {
          motivation = '💪 You can do this! Every step counts!';
        }

        embed.addFields({
          name: '💪 Motivation',
          value: motivation,
          inline: false
        });

        await interaction.editReply({ embeds: [embed] });

      } catch (apiError) {
        // If user doesn't exist in the system, show registration prompt
        const embed = new EmbedBuilder()
          .setColor(0xffa500)
          .setTitle('👤 User Not Found')
          .setDescription(
            `**User:** <@${userId}>\n\n` +
            `This user hasn't registered with WaddleTracker yet.\n` +
            `They need to visit the [WaddleTracker website](https://waddletracker.com) to create an account and link their Discord profile.`
          )
          .addFields({
            name: '🔗 How to Register',
            value: '1. Visit [waddletracker.com](https://waddletracker.com)\n2. Sign up with Discord\n3. Link your Discord account\n4. Start tracking your progress!',
            inline: false
          })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
