import React from 'react';
import { Eye, Heart, Bookmark, TrendingUp, MessageCircle, Users } from 'lucide-react';
import { PostInsight } from '../types/instagram';

interface GrowthPostsProps {
  posts: PostInsight[];
  type: 'followers' | 'likeRate' | 'commentRate' | 'saveRate';
}

export function GrowthPosts({ posts, type }: GrowthPostsProps) {
  // 直近1カ月と前月の期間を設定
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date(oneMonthAgo);
  twoMonthsAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // 前月の投稿をフィルタリング
  const previousMonthPosts = posts.filter(post => {
    const postDate = new Date(post.posted);
    return postDate >= twoMonthsAgo && postDate < oneMonthAgo;
  });

  // 前月の平均値を計算
  const previousMonthAverages = previousMonthPosts.reduce(
    (acc, post) => ({
      followers: acc.followers + post.engagement, // フォロワー増加率の代わりにエンゲージメントを使用
      likeRate: acc.likeRate + (post.likes / post.reach * 100),
      commentRate: acc.commentRate + (post.comments / post.reach * 100),
      saveRate: acc.saveRate + (post.saves / post.reach * 100),
      count: acc.count + 1
    }),
    { followers: 0, likeRate: 0, commentRate: 0, saveRate: 0, count: 0 }
  );

  const averages = {
    followers: previousMonthAverages.count > 0 
      ? previousMonthAverages.followers / previousMonthAverages.count 
      : 0,
    likeRate: previousMonthAverages.count > 0 
      ? previousMonthAverages.likeRate / previousMonthAverages.count 
      : 0,
    commentRate: previousMonthAverages.count > 0 
      ? previousMonthAverages.commentRate / previousMonthAverages.count 
      : 0,
    saveRate: previousMonthAverages.count > 0 
      ? previousMonthAverages.saveRate / previousMonthAverages.count 
      : 0
  };

  // 投稿をソート
  const sortedPosts = [...previousMonthPosts].sort((a, b) => {
    switch (type) {
      case 'followers':
        return b.engagement - a.engagement;
      case 'likeRate':
        return (b.likes / b.reach) - (a.likes / a.reach);
      case 'commentRate':
        return (b.comments / b.reach) - (a.comments / a.reach);
      case 'saveRate':
        return (b.saves / b.reach) - (a.saves / a.reach);
      default:
        return 0;
    }
  }).slice(0, 3);

  const getMetricIcon = () => {
    switch (type) {
      case 'followers':
        return Users;
      case 'likeRate':
        return Heart;
      case 'commentRate':
        return MessageCircle;
      case 'saveRate':
        return Bookmark;
    }
  };

  const getMetricColor = () => {
    switch (type) {
      case 'followers':
        return 'text-purple-500';
      case 'likeRate':
        return 'text-pink-500';
      case 'commentRate':
        return 'text-blue-500';
      case 'saveRate':
        return 'text-green-500';
    }
  };

  const getMetricValue = (post: PostInsight) => {
    switch (type) {
      case 'followers':
        return post.engagement.toFixed(1) + '%';
      case 'likeRate':
        return ((post.likes / post.reach) * 100).toFixed(1) + '%';
      case 'commentRate':
        return ((post.comments / post.reach) * 100).toFixed(1) + '%';
      case 'saveRate':
        return ((post.saves / post.reach) * 100).toFixed(1) + '%';
    }
  };

  const getGrowthRate = (post: PostInsight) => {
    const value = type === 'followers' ? post.engagement :
                 type === 'likeRate' ? (post.likes / post.reach * 100) :
                 type === 'commentRate' ? (post.comments / post.reach * 100) :
                 (post.saves / post.reach * 100);
    const average = averages[type];
    return ((value - average) / average * 100).toFixed(1);
  };

  const MetricIcon = getMetricIcon();
  const metricColor = getMetricColor();

  return (
    <div className="space-y-4">
      {sortedPosts.map(post => (
        <div key={post.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-1">
              {new Date(post.posted).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
              <MetricIcon className={`w-4 h-4 ${metricColor}`} />
              <p className="text-lg font-semibold">
                {getMetricValue(post)}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-600">
                +{getGrowthRate(post)}%
              </p>
            </div>
          </div>
        </div>
      ))}
      {sortedPosts.length === 0 && (
        <p className="text-sm text-gray-500 p-4 bg-white rounded-lg">
          前月平均を超える投稿がありません
        </p>
      )}
    </div>
  );
}