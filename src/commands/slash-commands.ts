import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandUserOption, SlashCommandIntegerOption, SlashCommandBooleanOption, SlashCommandChannelOption } from 'discord.js';

// Check-in command (smart - detects schedule)
export const checkinCommand = new SlashCommandBuilder()
  .setName('checkin')
  .setDescription('Smart check-in - detects if today is workout or rest day')
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('status')
      .setDescription('Did you go to the gym?')
      .setRequired(true)
      .addChoices(
        { name: 'Went to gym 💪', value: 'went' },
        { name: 'Missed workout 😔', value: 'missed' },
        { name: 'Rest day 😴', value: 'rest' }
      )
  )
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('workout_type')
      .setDescription('Type of workout (e.g., Upper Body, Cardio)')
      .setRequired(false)
  )
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('notes')
      .setDescription('Additional notes about your session')
      .setRequired(false)
      .setMaxLength(500)
  )
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('photo_url')
      .setDescription('URL of your gym photo (optional)')
      .setRequired(false)
  );

// Workout command (specific for workouts)
export const workoutCommand = new SlashCommandBuilder()
  .setName('workout')
  .setDescription('Log a workout session')
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('type')
      .setDescription('Type of workout')
      .setRequired(true)
      .addChoices(
        { name: 'Upper Body 💪', value: 'Upper Body' },
        { name: 'Lower Body 🦵', value: 'Lower Body' },
        { name: 'Cardio ❤️', value: 'Cardio' },
        { name: 'Full Body 🔥', value: 'Full Body' },
        { name: 'Yoga 🧘', value: 'Yoga' },
        { name: 'Other', value: 'Other' }
      )
  )
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('notes')
      .setDescription('Workout notes (sets, reps, etc.)')
      .setRequired(false)
      .setMaxLength(500)
  )
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('photo_url')
      .setDescription('URL of your gym photo (optional)')
      .setRequired(false)
  );

// Rest day command
export const restDayCommand = new SlashCommandBuilder()
  .setName('rest-day')
  .setDescription('Log a rest day for recovery')
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('notes')
      .setDescription('Rest day notes (optional)')
      .setRequired(false)
      .setMaxLength(500)
  );

// Profile command
export const profileCommand = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View user profile and stats')
  .addUserOption((option: SlashCommandUserOption) =>
    option
      .setName('user')
      .setDescription('User to view profile for (defaults to yourself)')
      .setRequired(false)
  );

// Cheer command
export const cheerCommand = new SlashCommandBuilder()
  .setName('cheer')
  .setDescription('Send encouragement to another user')
  .addUserOption((option: SlashCommandUserOption) =>
    option
      .setName('user')
      .setDescription('User to cheer for')
      .setRequired(true)
  )
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('message')
      .setDescription('Your encouraging message')
      .setRequired(true)
      .setMaxLength(500)
  );

// Streak command
export const streakCommand = new SlashCommandBuilder()
  .setName('streak')
  .setDescription('View streak information')
  .addUserOption((option: SlashCommandUserOption) =>
    option
      .setName('user')
      .setDescription('User to view streak for (defaults to yourself)')
      .setRequired(false)
  );

// Leaderboard command
export const leaderboardCommand = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View leaderboards')
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('streaks')
      .setDescription('View streak leaderboard')
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('type')
          .setDescription('Type of streak leaderboard')
          .setRequired(false)
          .addChoices(
            { name: 'Current Streaks', value: 'current' },
            { name: 'Longest Streaks', value: 'longest' }
          )
      )
      .addIntegerOption((option: SlashCommandIntegerOption) =>
        option
          .setName('limit')
          .setDescription('Number of users to show (1-50)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(50)
      )
  )
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('checkins')
      .setDescription('View check-in leaderboard')
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('period')
          .setDescription('Time period for leaderboard')
          .setRequired(false)
          .addChoices(
            { name: 'All Time', value: 'all' },
            { name: 'This Week', value: 'week' },
            { name: 'This Month', value: 'month' },
            { name: 'This Year', value: 'year' }
          )
      )
      .addIntegerOption((option: SlashCommandIntegerOption) =>
        option
          .setName('limit')
          .setDescription('Number of users to show (1-50)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(50)
      )
  );

// Schedule command (enhanced with flexible scheduling)
export const scheduleCommand = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('Manage your gym schedule with flexible patterns')
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('rotation')
      .setDescription('Create a rotation schedule (e.g., upper,lower,rest)')
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('pattern')
          .setDescription('Rotation pattern (e.g., upper,lower,rest,upper,lower,rest,rest)')
          .setRequired(true)
      )
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('time')
          .setDescription('Reminder time in 24-hour format (e.g., 09:00)')
          .setRequired(false)
      )
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('timezone')
          .setDescription('Your timezone (e.g., UTC, America/New_York)')
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('weekly')
      .setDescription('Create a weekly schedule')
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('days')
          .setDescription('Workout days (comma-separated: Monday,Wednesday,Friday)')
          .setRequired(true)
      )
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('time')
          .setDescription('Reminder time in 24-hour format (e.g., 18:00)')
          .setRequired(false)
      )
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('timezone')
          .setDescription('Your timezone (e.g., UTC, America/New_York)')
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('view')
      .setDescription('View your current schedule')
  )
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('delete')
      .setDescription('Delete your schedule')
  )
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('today')
      .setDescription('Check what type of day today is (workout/rest)')
  );

// Gallery command
export const galleryCommand = new SlashCommandBuilder()
  .setName('gallery')
  .setDescription('View user photo gallery')
  .addUserOption((option: SlashCommandUserOption) =>
    option
      .setName('user')
      .setDescription('User to view gallery for (defaults to yourself)')
      .setRequired(false)
  )
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('status')
      .setDescription('Filter by check-in status')
      .setRequired(false)
      .addChoices(
        { name: 'All Photos', value: 'all' },
        { name: 'Went to Gym', value: 'went' },
        { name: 'Missed Workout', value: 'missed' }
      )
  )
  .addIntegerOption((option: SlashCommandIntegerOption) =>
    option
      .setName('page')
      .setDescription('Page number (default: 1)')
      .setRequired(false)
      .setMinValue(1)
  )
  .addIntegerOption((option: SlashCommandIntegerOption) =>
    option
      .setName('limit')
      .setDescription('Photos per page (1-20)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(20)
  );

// Notifications command
export const notificationsCommand = new SlashCommandBuilder()
  .setName('notifications')
  .setDescription('Manage your notifications')
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('view')
      .setDescription('View your notifications')
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('type')
          .setDescription('Filter by notification type')
          .setRequired(false)
          .addChoices(
            { name: 'All Notifications', value: 'all' },
            { name: 'Cheers', value: 'cheer' },
            { name: 'Reminders', value: 'reminder' },
            { name: 'Achievements', value: 'achievement' },
            { name: 'System', value: 'system' }
          )
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option
          .setName('unread_only')
          .setDescription('Show only unread notifications')
          .setRequired(false)
      )
      .addIntegerOption((option: SlashCommandIntegerOption) =>
        option
          .setName('page')
          .setDescription('Page number (default: 1)')
          .setRequired(false)
          .setMinValue(1)
      )
  )
  .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
    subcommand
      .setName('mark_read')
      .setDescription('Mark notifications as read')
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName('notification_ids')
          .setDescription('Comma-separated notification IDs (leave empty for all)')
          .setRequired(false)
      )
  );

// Analytics command
export const analyticsCommand = new SlashCommandBuilder()
  .setName('analytics')
  .setDescription('View your analytics and stats')
  .addIntegerOption((option: SlashCommandIntegerOption) =>
    option
      .setName('period')
      .setDescription('Number of days to analyze (1-365)')
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(365)
  );

// Help command
export const helpCommand = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Get help with bot commands')
  .addStringOption((option: SlashCommandStringOption) =>
    option
      .setName('command')
      .setDescription('Specific command to get help for')
      .setRequired(false)
      .addChoices(
        { name: 'checkin', value: 'checkin' },
        { name: 'workout', value: 'workout' },
        { name: 'rest-day', value: 'rest-day' },
        { name: 'profile', value: 'profile' },
        { name: 'cheer', value: 'cheer' },
        { name: 'streak', value: 'streak' },
        { name: 'leaderboard', value: 'leaderboard' },
        { name: 'schedule', value: 'schedule' },
        { name: 'gallery', value: 'gallery' },
        { name: 'notifications', value: 'notifications' },
        { name: 'analytics', value: 'analytics' }
      )
  );

// Export all commands
export const commands = [
  checkinCommand,
  workoutCommand,
  restDayCommand,
  profileCommand,
  cheerCommand,
  streakCommand,
  leaderboardCommand,
  scheduleCommand,
  galleryCommand,
  notificationsCommand,
  analyticsCommand,
  helpCommand
];
