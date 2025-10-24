import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, createConfirmationButtons, getStatusEmoji, getStatusColor } from './index';
import { apiClient } from '../../services/api-client';
import { ValidationError } from '../../types';
import logger from '../../utils/logger';

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

      try {
        // Try to log check-in first
        const embedData = await apiClient.logCheckin({
          discord_id: userId,
          username: interaction.user.username,
          avatar_url: interaction.user.displayAvatarURL(),
          status,
          photo_url: photoUrl || undefined,
          date: now
        });

        const embed = new EmbedBuilder()
          .setColor(embedData.color || 0x00ff00)
          .setTitle(embedData.title || '🏋️ Check-in Logged!')
          .setDescription(embedData.description || `**User:** <@${userId}>`)
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        // Add fields if they exist
        if (embedData.fields) {
          embed.addFields(embedData.fields);
        }

        // Add footer if it exists
        if (embedData.footer) {
          embed.setFooter(embedData.footer);
        }

        await interaction.editReply({ embeds: [embed] });

      } catch (apiError) {
        // If user doesn't exist, show registration embed with button
        try {
          const registerEmbedData = await apiClient.getRegisterEmbed({
            discord_id: userId,
            username: interaction.user.username,
            avatar_url: interaction.user.displayAvatarURL()
          });

          const embed = new EmbedBuilder()
            .setColor(registerEmbedData.color || 0xffa500)
            .setTitle(registerEmbedData.title || '🔐 Registration Required')
            .setDescription(registerEmbedData.description || `**User:** <@${userId}>\n\nYou need to register with WaddleTracker before you can log check-ins.`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          // Add fields if they exist
          if (registerEmbedData.fields) {
            embed.addFields(registerEmbedData.fields);
          }

          // Add footer if it exists
          if (registerEmbedData.footer) {
            embed.setFooter(registerEmbedData.footer);
          }

          // Add registration buttons
          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`register_${userId}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${userId}`)
                .setLabel('Learn More')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('ℹ️')
            );

          await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
          });

        } catch (registerError) {
          // Fallback if registration embed fails
          const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('🔐 Registration Required')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `You need to register with WaddleTracker before you can log check-ins.\n` +
              `Click the "Register Now!" button below to get started!`
            )
            .addFields({
              name: '🔗 What You\'ll Get',
              value: '• Track your gym sessions\n• Build streaks and achievements\n• Get motivation from the community\n• View your progress analytics',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          // Add registration buttons
          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`register_${userId}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${userId}`)
                .setLabel('Learn More')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('ℹ️')
            );

          await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
          });
        }
      }

    } catch (error: any) {
      logger.error('Checkin command error:', error);
      
      try {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Check-in Error')
          .setDescription(
            `Unable to log your check-in. This could be due to:\n` +
            `• Network connectivity issues\n` +
            `• Server maintenance\n` +
            `• Account synchronization delay\n\n` +
            `**Error:** ${error.message || 'Unknown error'}\n\n` +
            `Please try again in a few moments. If the problem persists, contact support.`
          )
          .addFields({
            name: '🔧 Troubleshooting',
            value: '• Try `/checkin` again in a few seconds\n• Check if other commands work\n• Contact support if the issue continues',
            inline: false
          })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } catch (errorHandlingError) {
        logger.error('Failed to send checkin error message:', errorHandlingError);
        await handleApiError(interaction, error);
      }
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
