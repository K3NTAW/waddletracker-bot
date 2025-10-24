import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, getTargetUserId } from './index';
import { apiClient } from '../../services/api-client';
import { ValidationError } from '../../types';

export class CheerHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Defer reply immediately to prevent timeout
    await interaction.deferReply();
    
    try {
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

      try {
        // Try to send cheer
        const cheerData = await apiClient.sendCheer({
          to_user_id: targetUserId,
          message: message
        }, 'discord-token'); // TODO: Get proper token

        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('🎉 Cheer Sent!')
          .setDescription(
            `**From:** <@${interaction.user.id}>\n` +
            `**To:** <@${targetUserId}>\n` +
            `**Message:** ${message}`
          )
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } catch (apiError: any) {
        // If user doesn't exist, show registration embed with button
        try {
          const registerEmbedData = await apiClient.getRegisterEmbed({
            discord_id: interaction.user.id,
            username: interaction.user.username,
            avatar_url: interaction.user.displayAvatarURL()
          });

          const embed = new EmbedBuilder()
            .setColor(registerEmbedData.color || 0xffa500)
            .setTitle(registerEmbedData.title || '🔐 Registration Required')
            .setDescription(registerEmbedData.description || `**From:** <@${interaction.user.id}>\n**To:** <@${targetUserId}>\n\nYou need to register with WaddleTracker before you can send cheers.`)
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
                .setCustomId(`register_${interaction.user.id}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${interaction.user.id}`)
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
              `**From:** <@${interaction.user.id}>\n` +
              `**To:** <@${targetUserId}>\n\n` +
              `You need to register with WaddleTracker before you can send cheers.\n` +
              `Click the "Register Now!" button below to get started!`
            )
            .addFields({
              name: '🔗 What You\'ll Get',
              value: '• Send encouragement to friends\n• Receive cheers from the community\n• Build a supportive fitness network\n• Motivate others on their journey',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          // Add registration buttons
          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`register_${interaction.user.id}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${interaction.user.id}`)
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

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
