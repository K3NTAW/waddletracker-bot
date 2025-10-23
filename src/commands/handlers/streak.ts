import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { CommandHandler, createErrorEmbed, handleApiError, getTargetUserId, formatStreak } from './index';
import { apiClient } from '../../services/api-client';

export class StreakHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply();

      const targetUserId = getTargetUserId(interaction);
      const isSelf = targetUserId === interaction.user.id;

      // For now, we'll create a mock streak since we don't have user data
      // In a real implementation, you'd call apiClient.getUserStreak(targetUserId)
      const currentStreak = 5;
      const longestStreak = 12;
      const totalCheckins = 45;

      const embed = new EmbedBuilder()
        .setColor(0xff6b35)
        .setTitle(`🔥 ${isSelf ? 'Your' : 'User'} Streak Information`)
        .setDescription(`**User:** <@${targetUserId}>`)
        .addFields(
          {
            name: '🔥 Current Streak',
            value: `${formatStreak(currentStreak)}`,
            inline: true
          },
          {
            name: '🏆 Longest Streak',
            value: `${formatStreak(longestStreak)}`,
            inline: true
          },
          {
            name: '📊 Total Check-ins',
            value: `${totalCheckins}`,
            inline: true
          }
        );

      // Add streak motivation based on current streak
      if (currentStreak <= 0) {
        embed.addFields({
          name: '💪 Motivation',
          value: 'Start your fitness journey today! Every streak begins with a single step.',
          inline: false
        });
      } else if (currentStreak < 7) {
        embed.addFields({
          name: '💪 Motivation',
          value: 'Great start! Keep building that momentum!',
          inline: false
        });
      } else if (currentStreak < 30) {
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

      // Add streak history (mock data)
      embed.addFields({
        name: '📈 Recent Streak History',
        value: '• 5 days (current)\n• 3 days (2 weeks ago)\n• 8 days (1 month ago)',
        inline: false
      });

      embed.setThumbnail(interaction.user.displayAvatarURL());
      embed.setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // TODO: In a real implementation, you would:
      // 1. Call apiClient.getUserStreak(targetUserId)
      // 2. Use the returned streak data
      // 3. Handle cases where user doesn't exist in the system

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
