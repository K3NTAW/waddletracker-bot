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

      // Show registration required message
      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('🔐 Authentication Required')
        .setDescription(
          `**From:** <@${interaction.user.id}>\n` +
          `**To:** <@${targetUserId}>\n\n` +
          `You need to register with WaddleTracker before you can send cheers.\n` +
          `Please visit the [WaddleTracker website](https://waddletracker.com) to create an account and link your Discord profile.`
        )
        .addFields(
          {
            name: '🔗 How to Get Started',
            value: '1. Visit [waddletracker.com](https://waddletracker.com)\n2. Sign up with Discord\n3. Link your Discord account\n4. Come back and use `/cheer`!',
            inline: false
          },
          {
            name: '💡 What You\'ll Get',
            value: '• Send encouragement to friends\n• Receive cheers from the community\n• Build a supportive fitness network\n• Motivate others on their journey',
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
}
