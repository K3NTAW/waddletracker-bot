import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, createConfirmationButtons, getStatusEmoji, getStatusColor } from './index';
import { apiClient } from '../../services/api-client';
import { ValidationError } from '../../types';

export class CheckinHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const status = interaction.options.getString('status', true) as 'went' | 'missed';
      const photoUrl = interaction.options.getString('photo_url');

      // Validate status
      if (!['went', 'missed'].includes(status)) {
        throw new ValidationError('Status must be either "went" or "missed"');
      }

      // Validate photo URL if provided
      if (photoUrl && !this.isValidUrl(photoUrl)) {
        throw new ValidationError('Invalid photo URL format');
      }

      const userId = getUserId(interaction);
      const now = new Date().toISOString();

      // Create check-in data
      const checkInData = {
        date: now,
        status,
        photo_url: photoUrl || undefined,
        discord_message_id: interaction.id // Use interaction ID as message ID
      };

      // Show registration required message
      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('🔐 Authentication Required')
        .setDescription(
          `**User:** <@${userId}>\n\n` +
          `You need to register with WaddleTracker before you can log check-ins.\n` +
          `Please visit the [WaddleTracker website](https://waddletracker.com) to create an account and link your Discord profile.`
        )
        .addFields(
          {
            name: '🔗 How to Get Started',
            value: '1. Visit [waddletracker.com](https://waddletracker.com)\n2. Sign up with Discord\n3. Link your Discord account\n4. Come back and use `/checkin`!',
            inline: false
          },
          {
            name: '💡 What You\'ll Get',
            value: '• Track your gym sessions\n• Build streaks and achievements\n• Get motivation from the community\n• View your progress analytics',
            inline: false
          }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
