import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, getTargetUserId } from './index';
import { apiClient } from '../../services/api-client';
import { ValidationError } from '../../types';

export class CheerHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply();

      const targetUserId = getTargetUserId(interaction);
      const message = interaction.options.getString('message', true);

      // Validate that user isn't cheering themselves
      if (targetUserId === interaction.user.id) {
        throw new ValidationError('You cannot cheer for yourself!');
      }

      // Validate message length
      if (message.length < 3) {
        throw new ValidationError('Cheer message must be at least 3 characters long');
      }

      if (message.length > 500) {
        throw new ValidationError('Cheer message must be less than 500 characters');
      }

      // Create cheer embed
      const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle('🎉 Someone sent you a cheer!')
        .setDescription(`**From:** <@${interaction.user.id}>\n**Message:** ${message}`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      // Add confirmation buttons
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`cheer_send_${interaction.id}`)
            .setLabel('Send Cheer')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`cheer_cancel_${interaction.id}`)
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
        );

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });

      // TODO: In a real implementation, you would:
      // 1. Get user's JWT token from Discord OAuth2
      // 2. Call apiClient.sendCheer({ to_user_id: targetUserId, message }, token)
      // 3. Get cheer embed from apiClient.getCheerEmbed()
      // 4. Send notification to the target user
      // 5. Post the cheer to the general channel

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
