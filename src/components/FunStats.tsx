import React from 'react';
import { Trophy, Heart, Eye, Activity, Calendar, Clock, Sparkles, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { PostInsight } from '../types/instagram';

interface FunStatsProps {
  posts: PostInsight[];
}

export function FunStats({ posts }: FunStatsProps) {
  // Calculate current month's stats
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  // Calculate previous month's stats
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  const currentMonthStats = posts
    .filter(post => new Date(post.posted) >= monthAgo)
    .reduce((acc, post) => ({
      likes: acc.likes + post.likes,
      impressions: acc.impressions + post.reach,
      engagement: acc.engagement + post.engagement,
      followers: 24892, // Current followers from mockData
      postCount: acc.postCount + 1
    }), { likes: 0, impressions: 0, engagement: 0, followers: 0, postCount: 0 });

  const previousMonthStats = posts
    .filter(post => {
      const postDate = new Date(post.posted);
      return postDate >= twoMonthsAgo && postDate < monthAgo;
    })
    .reduce((acc, post) => ({
      likes: acc.likes + post.likes,
      impressions: acc.impressions + post.reach,
      engagement: acc.engagement + post.engagement,
      followers: 24200, // Previous month followers from mockData
      postCount: acc.postCount + 1
    }), { likes: 0, impressions: 0, engagement: 0, followers: 0, postCount: 0 });

  const calculateChange = (current: number, previous: number) => {
    return previous > 0 ? ((current - previous) / previous) * 100 : 100;
  };

  const likesChange = calculateChange(currentMonthStats.likes, previousMonthStats.likes);
  const impressionsChange = calculateChange(currentMonthStats.impressions, previousMonthStats.impressions);
  const engagementChange = calculateChange(
    currentMonthStats.engagement / (currentMonthStats.postCount || 1),
    previousMonthStats.engagement / (previousMonthStats.postCount || 1)
  );
  const followersChange = calculateChange(currentMonthStats.followers, previousMonthStats.followers);

  // Calculate best posting time
  const postTimes = posts.map(post => new Date(post.posted).getHours());
  const bestHour = postTimes.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  
  const bestPostingHour = Object.entries(bestHour)
    .sort(([,a], [,b]) => b - a)[0][0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Monthly Love */}
      <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Love</h3>
          </div>
          <Sparkles className="w-5 h-5 text-pink-400" />
        </div>
        <div className="text-3xl font-bold text-pink-600 mb-2">
          {currentMonthStats.likes.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          {likesChange > 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <p className={`text-sm font-medium ${likesChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {Math.abs(likesChange).toFixed(1)}% {likesChange > 0 ? 'increase' : 'decrease'}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          vs. previous month ({previousMonthStats.likes.toLocaleString()} likes)
        </p>
      </div>

      {/* Monthly Followers */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Followers</h3>
          </div>
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="text-3xl font-bold text-emerald-600 mb-2">
          {currentMonthStats.followers.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          {followersChange > 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <p className={`text-sm font-medium ${followersChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {Math.abs(followersChange).toFixed(1)}% {followersChange > 0 ? 'increase' : 'decrease'}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          vs. previous month ({previousMonthStats.followers.toLocaleString()} followers)
        </p>
      </div>

      {/* Monthly Impressions */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Impressions</h3>
          </div>
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {currentMonthStats.impressions.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          {impressionsChange > 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <p className={`text-sm font-medium ${impressionsChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {Math.abs(impressionsChange).toFixed(1)}% {impressionsChange > 0 ? 'increase' : 'decrease'}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          vs. previous month ({previousMonthStats.impressions.toLocaleString()})
        </p>
      </div>

      {/* Monthly Engagement */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Engagement</h3>
          </div>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div className="text-3xl font-bold text-purple-600 mb-2">
          {(currentMonthStats.engagement / (currentMonthStats.postCount || 1)).toFixed(1)}%
        </div>
        <div className="flex items-center gap-2">
          {engagementChange > 0 ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <p className={`text-sm font-medium ${engagementChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {Math.abs(engagementChange).toFixed(1)}% {engagementChange > 0 ? 'increase' : 'decrease'}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          vs. previous month ({(previousMonthStats.engagement / (previousMonthStats.postCount || 1)).toFixed(1)}%)
        </p>
      </div>

      {/* Best Posting Time */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Prime Time</h3>
          </div>
          <Calendar className="w-5 h-5 text-amber-400" />
        </div>
        <div className="text-3xl font-bold text-amber-600 mb-2">
          {parseInt(bestPostingHour)}:00
        </div>
        <p className="text-sm text-gray-600">
          is your most engaging posting time
        </p>
      </div>
    </div>
  );
}