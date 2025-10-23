import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, handleApiError, getTargetUserId, createPaginationButtons, formatDate, getStatusEmoji } from './index';
import { apiClient } from '../../services/api-client';

export class GalleryHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply();

      const targetUserId = getTargetUserId(interaction);
      const status = interaction.options.getString('status') || 'all';
      const page = interaction.options.getInteger('page') || 1;
      const limit = interaction.options.getInteger('limit') || 10;

      const isSelf = targetUserId === interaction.user.id;

      try {
        // Get real gallery data from API
        const galleryData = await apiClient.getGallery(targetUserId, { page, limit, status: status as 'all' | 'went' | 'missed' });

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`📸 ${isSelf ? 'Your' : 'User'} Photo Gallery`)
          .setDescription(`**User:** <@${targetUserId}>\n**Total Photos:** ${galleryData.pagination.total}`)
          .setTimestamp();

        if (galleryData.photos.length === 0) {
          embed.addFields({
            name: '📷 No Photos Found',
            value: status === 'all' 
              ? 'No photos have been uploaded yet.'
              : `No photos found with status: ${status}`,
            inline: false
          });
        } else {
          // Add photo information
          const photoInfo = galleryData.photos.map((photo, index) => {
            const photoNumber = (galleryData.pagination.page - 1) * galleryData.pagination.limit + index + 1;
            return `**${photoNumber}.** ${getStatusEmoji(photo.status)} ${formatDate(photo.date)}`;
          }).join('\n');

          embed.addFields({
            name: `📷 Photos (${galleryData.pagination.page} of ${galleryData.pagination.pages})`,
            value: photoInfo,
            inline: false
          });

          // Set the first photo as the embed image
          if (galleryData.photos[0]?.photo_url) {
            embed.setImage(galleryData.photos[0].photo_url);
          }
        }

        // Add pagination buttons if there are multiple pages
        const components = galleryData.pagination.pages > 1 ? createPaginationButtons(page, galleryData.pagination.pages) : [];

        await interaction.editReply({
          embeds: [embed],
          components
        });

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
            value: '1. Visit [waddletracker.com](https://waddletracker.com)\n2. Sign up with Discord\n3. Link your Discord account\n4. Start sharing your fitness journey!',
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
