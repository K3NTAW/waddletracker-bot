import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../config';
import logger from '../utils/logger';
import { apiClient } from './api-client';

export class SchedulerService {
  private client: Client;
  private reminderInterval: NodeJS.Timeout | null = null;

  constructor(client: Client) {
    this.client = client;
  }

  start(): void {
    logger.info('Starting scheduler service...');
    
    // Check for reminders every minute
    this.reminderInterval = setInterval(() => {
      this.checkReminders().catch(error => {
        logger.error('Error checking reminders:', error);
      });
    }, 60000); // Check every minute

    logger.info('Scheduler service started');
  }

  stop(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      logger.info('Scheduler service stopped');
    }
  }

  private async checkReminders(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

      logger.debug(`Checking reminders for ${currentDay} at ${currentTime}`);

      // For now, we'll implement a simple reminder system
      // In a real implementation, you would:
      // 1. Query the database for users with schedules matching current day/time
      // 2. Send reminders to those users
      // 3. Handle different time zones

      // Mock reminder check - in production, this would query the API
      if (this.shouldSendReminder(currentTime)) {
        await this.sendWorkoutReminder();
      }

    } catch (error) {
      logger.error('Error in reminder check:', error);
    }
  }

  private shouldSendReminder(time: string): boolean {
    // Mock logic - in production, this would check against user schedules
    // For demo purposes, send reminder at 18:00 (6 PM)
    return time === '18:00';
  }

  private async sendWorkoutReminder(): Promise<void> {
    try {
      const channel = this.client.channels.cache.get(config.channelGeneral) as TextChannel;
      
      if (!channel) {
        logger.warn('General channel not found for reminders');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xff6b35)
        .setTitle('🏋️ Workout Reminder!')
        .setDescription('It\'s time for your scheduled workout! 💪')
        .addFields(
          {
            name: '💪 Ready to crush it?',
            value: 'Use `/checkin` to log your workout when you\'re done!',
            inline: false
          },
          {
            name: '📸 Share your progress',
            value: 'Don\'t forget to take a photo and share it with the community!',
            inline: false
          }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      logger.info('Workout reminder sent');

    } catch (error) {
      logger.error('Error sending workout reminder:', error);
    }
  }

  // Method to send achievement notifications
  async sendAchievementNotification(userId: string, achievement: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(userId);
      if (!user) {
        logger.warn(`User ${userId} not found for achievement notification`);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle('🏆 Achievement Unlocked!')
        .setDescription(`Congratulations ${user.username}!`)
        .addFields({
          name: '🎉 Achievement',
          value: achievement,
          inline: false
        })
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await user.send({ embeds: [embed] });
      logger.info(`Achievement notification sent to ${user.username}`);

    } catch (error) {
      logger.error('Error sending achievement notification:', error);
    }
  }

  // Method to send cheer notifications
  async sendCheerNotification(userId: string, fromUser: string, message: string): Promise<void> {
    try {
      const user = await this.client.users.fetch(userId);
      if (!user) {
        logger.warn(`User ${userId} not found for cheer notification`);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle('🎉 Someone cheered for you!')
        .setDescription(`**From:** ${fromUser}\n**Message:** ${message}`)
        .setTimestamp();

      await user.send({ embeds: [embed] });
      logger.info(`Cheer notification sent to ${user.username}`);

    } catch (error) {
      logger.error('Error sending cheer notification:', error);
    }
  }
}
