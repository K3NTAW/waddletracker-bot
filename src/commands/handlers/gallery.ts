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

      // For now, we'll create a mock gallery
      // In a real implementation, you'd call apiClient.getGallery(targetUserId, { page, limit, status })
      const mockPhotos = [
        {
          id: '1',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'went' as const,
          photo_url: 'https://cdn.discordapp.com/attachments/123456789/photo1.jpg'
        },
        {
          id: '2',
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'went' as const,
          photo_url: 'https://cdn.discordapp.com/attachments/123456789/photo2.jpg'
        },
        {
          id: '3',
          date: new Date(Date.now() - 259200000).toISOString(),
          status: 'missed' as const,
          photo_url: 'https://cdn.discordapp.com/attachments/123456789/photo3.jpg'
        }
      ];

      // Filter photos by status if specified
      const filteredPhotos = status === 'all' 
        ? mockPhotos 
        : mockPhotos.filter(photo => photo.status === status);

      const totalPhotos = filteredPhotos.length;
      const totalPages = Math.ceil(totalPhotos / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, totalPhotos);
      const pagePhotos = filteredPhotos.slice(startIndex, endIndex);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`📸 ${isSelf ? 'Your' : 'User'} Photo Gallery`)
        .setDescription(`**User:** <@${targetUserId}>\n**Total Photos:** ${totalPhotos}`)
        .setTimestamp();

      if (pagePhotos.length === 0) {
        embed.addFields({
          name: '📷 No Photos Found',
          value: status === 'all' 
            ? 'No photos have been uploaded yet.'
            : `No photos found with status: ${status}`,
          inline: false
        });
      } else {
        // Add photo information
        const photoInfo = pagePhotos.map((photo, index) => {
          const photoNumber = startIndex + index + 1;
          return `**${photoNumber}.** ${getStatusEmoji(photo.status)} ${formatDate(photo.date)}`;
        }).join('\n');

        embed.addFields({
          name: `📷 Photos (${startIndex + 1}-${endIndex} of ${totalPhotos})`,
          value: photoInfo,
          inline: false
        });

        // Set the first photo as the embed image
        if (pagePhotos[0]?.photo_url) {
          embed.setImage(pagePhotos[0].photo_url);
        }
      }

      // Add pagination buttons if there are multiple pages
      const components = totalPages > 1 ? createPaginationButtons(page, totalPages) : [];

      await interaction.editReply({
        embeds: [embed],
        components
      });

      // TODO: In a real implementation, you would:
      // 1. Call apiClient.getGallery(targetUserId, { page, limit, status })
      // 2. Use the returned pagination data
      // 3. Handle cases where user doesn't exist in the system
      // 4. Implement proper image display for multiple photos

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
