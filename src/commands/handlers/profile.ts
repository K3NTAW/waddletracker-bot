import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
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
