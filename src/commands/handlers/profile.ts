import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, handleApiError, getTargetUserId } from './index';
import { apiClient } from '../../services/api-client';

export class ProfileHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply();

      const targetUserId = getTargetUserId(interaction);
      const isSelf = targetUserId === interaction.user.id;

      try {
        // Get profile embed from API
        const embedData = await apiClient.getProfileEmbed(targetUserId);
        
        const embed = new EmbedBuilder()
          .setColor(embedData.color || 0x0099ff)
          .setTitle(embedData.title || `🏋️ ${isSelf ? 'Your' : 'User'} Profile`)
          .setDescription(embedData.description || `**User:** <@${targetUserId}>`)
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
            discord_id: targetUserId,
            username: interaction.user.username,
            avatar_url: interaction.user.displayAvatarURL()
          });

          const embed = new EmbedBuilder()
            .setColor(registerEmbedData.color || 0xffa500)
            .setTitle(registerEmbedData.title || '👤 Registration Required')
            .setDescription(registerEmbedData.description || `**User:** <@${targetUserId}>\n\nThis user needs to register with WaddleTracker to use the bot features.`)
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
                .setCustomId(`register_${targetUserId}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${targetUserId}`)
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
            .setTitle('👤 Registration Required')
            .setDescription(
              `**User:** <@${targetUserId}>\n\n` +
              `This user needs to register with WaddleTracker to use the bot features.\n` +
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
                .setCustomId(`register_${targetUserId}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${targetUserId}`)
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
