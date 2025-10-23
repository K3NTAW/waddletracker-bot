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

      // For now, we'll simulate the API call since we don't have authentication tokens
      // In a real implementation, you'd need to handle Discord OAuth2 flow
      const embed = new EmbedBuilder()
        .setColor(getStatusColor(status))
        .setTitle(`${getStatusEmoji(status)} Check-in ${status === 'went' ? 'Successful' : 'Recorded'}`)
        .setDescription(
          `**Status:** ${status === 'went' ? 'Went to gym' : 'Missed workout'}\n` +
          `**Date:** ${new Date().toLocaleString()}\n` +
          `**User:** <@${userId}>`
        )
        .setTimestamp();

      if (photoUrl) {
        embed.setImage(photoUrl);
      }

      // Add confirmation buttons
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`checkin_confirm_${interaction.id}`)
            .setLabel('Confirm Check-in')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`checkin_cancel_${interaction.id}`)
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
        );

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });

      // TODO: In a real implementation, you would:
      // 1. Get user's JWT token from Discord OAuth2
      // 2. Call apiClient.createCheckIn(checkInData, token)
      // 3. Post the embed to the gym-pics channel
      // 4. Update user's streak display

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
