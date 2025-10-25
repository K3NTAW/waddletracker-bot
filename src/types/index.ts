// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  message?: string;
  timestamp: string;
}

// User Types
export interface User {
  id: string;
  discord_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  current_streak: number;
  longest_streak: number;
  total_checkins: number;
  recent_checkins: CheckIn[];
}

// Check-in Types
export interface CheckIn {
  id: string;
  user_id: string;
  date: string;
  status: 'went' | 'missed';
  photo_url?: string;
  discord_message_id?: string;
  created_at: string;
  updated_at: string;
}

// Streak Types
export interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_checkins: number;
}

// Schedule Types
export interface Schedule {
  id: string;
  user_id: string;
  days_of_week: string[];
  time: string;
  created_at: string;
  updated_at: string;
}

// Cheer Types
export interface Cheer {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
  from_user?: User;
  to_user?: User;
}

// Leaderboard Types
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  value: number;
  rank: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  total: number;
  embed: DiscordEmbed;
}

// Discord Embed Types
export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: DiscordEmbedFooter;
  thumbnail?: DiscordEmbedThumbnail;
  image?: DiscordEmbedImage;
  timestamp?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedThumbnail {
  url: string;
}

export interface DiscordEmbedImage {
  url: string;
}


// Analytics Types
export interface AnalyticsData {
  period: number;
  total_checkins: number;
  went_count: number;
  missed_count: number;
  consistency_rate: number;
  average_streak: number;
  best_streak: number;
  checkin_trends: {
    date: string;
    count: number;
  }[];
  weekly_breakdown: {
    day: string;
    count: number;
  }[];
}

// Bot Configuration Types
export interface BotConfig {
  discordToken: string;
  guildId: string;
  apiBaseUrl: string;
  channelGymPics: string;
  channelGeneral: string;
  logLevel: string;
}

// Command Types
export interface CommandData {
  name: string;
  description: string;
  options?: CommandOption[];
}

export interface CommandOption {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: CommandChoice[];
}

export interface CommandChoice {
  name: string;
  value: string | number;
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
