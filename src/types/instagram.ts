export interface InsightMetrics {
  followers: number;
  followersGrowth: number;
  engagement: number;
  impressions: number;
  reach: number;
  profileViews: number;
  websiteClicks: number;
  contactClicks: number;
}

export interface PostInsight {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  saves: number;
  reach: number;
  engagement: number;
  posted: string;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  aiReply?: string;
}

export interface TimeSeriesMetric {
  date: string;
  impressions: number;
  likes: number;
  followers: number;
  saves: number;
  profileViews: number;
  websiteClicks: number;
  contactClicks: number;
  posts?: PostInsight[]; // 追加: その日の投稿一覧
}

export interface TimeSeriesData {
  daily: TimeSeriesMetric[];
  weekly: TimeSeriesMetric[];
  monthly: TimeSeriesMetric[];
}

export interface InsightData {
  metrics: InsightMetrics;
  recentPosts: PostInsight[];
  weeklyGrowth: { date: string; followers: number }[];
  engagementRate: { date: string; rate: number }[];
  comments: Comment[];
  timeSeriesData: TimeSeriesData;
}

export type ReplyTiming = '1hour' | '3hours' | '6hours' | '12hours';
export type ReplyDuration = '1day' | '3days' | '7days' | '30days' | 'unlimited';
export type ReplyLimit = '1' | 'unlimited';
export type MatchType = 'exact' | 'contains';
export type ReplyType = 'comment' | 'dm';

export interface ReplySettings {
  matchText: string;
  matchType: MatchType;
  replyText: string;
  replyType: ReplyType;
  replyTiming: ReplyTiming;
  replyDuration: ReplyDuration;
  replyLimit: ReplyLimit;
}