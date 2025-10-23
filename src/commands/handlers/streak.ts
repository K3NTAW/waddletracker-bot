import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { CommandHandler, createErrorEmbed, handleApiError, getTargetUserId, formatStreak } from './index';
import { apiClient } from '../../services/api-client';

export class StreakHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply();

      const targetUserId = getTargetUserId(interaction);
      const isSelf = targetUserId === interaction.user.id;

      try {
        // Get real streak data from API
        const streakData = await apiClient.getUserStreak(targetUserId);

        const embed = new EmbedBuilder()
          .setColor(0xff6b35)
          .setTitle(`🔥 ${isSelf ? 'Your' : 'User'} Streak Information`)
          .setDescription(`**User:** <@${targetUserId}>`)
          .addFields(
            {
              name: '🔥 Current Streak',
              value: `${formatStreak(streakData.current_streak)}`,
              inline: true
            },
            {
              name: '🏆 Longest Streak',
              value: `${formatStreak(streakData.longest_streak)}`,
              inline: true
            },
            {
              name: '📊 Total Check-ins',
              value: `${streakData.total_checkins}`,
              inline: true
            }
          );

        // Add streak motivation based on current streak
        if (streakData.current_streak <= 0) {
          embed.addFields({
            name: '💪 Motivation',
            value: 'Start your fitness journey today! Every streak begins with a single step.',
            inline: false
          });
        } else if (streakData.current_streak < 7) {
          embed.addFields({
            name: '💪 Motivation',
            value: 'Great start! Keep building that momentum!',
            inline: false
          });
        } else if (streakData.current_streak < 30) {
          embed.addFields({
            name: '💪 Motivation',
            value: 'Amazing! You\'re building a solid habit!',
            inline: false
          });
        } else {
          embed.addFields({
            name: '💪 Motivation',
            value: 'Incredible! You\'re a fitness champion! 🏆',
            inline: false
          });
        }

        embed.setThumbnail(interaction.user.displayAvatarURL());
        embed.setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } catch (apiError) {
        // If user doesn't exist in the system, show registration prompt
        const embed = new EmbedBuilder()
          .setColor(0xffa500)
          .setTitle('👤 User Not Found')
          .setDescription(
            `**User:** <@${targetUserId}>\n\n` +
            `This user hasn't registered with WaddleTracker yet.\n` +
            `They need to visit the [WaddleTracker website](https://waddletracker.com) to create an account and link their Discord profile.`
          )
          .addFields({
            name: '🔗 How to Register',
            value: '1. Visit [waddletracker.com](https://waddletracker.com)\n2. Sign up with Discord\n3. Link your Discord account\n4. Start tracking your fitness journey!',
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
