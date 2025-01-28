import React from 'react';
import { Eye, Heart, Bookmark, MessageCircle, Users } from 'lucide-react';
import { PostInsight } from '../types/instagram';

interface TopPostsProps {
  posts: PostInsight[];
}

export function TopPosts({ posts }: TopPostsProps) {
  // 直近1カ月の投稿をフィルタリング
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const recentPosts = posts.filter(post => 
    new Date(post.posted) >= oneMonthAgo
  );

  // いいね、保存、コメント、フォロワー数でそれぞれソート
  const topByLikes = [...recentPosts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  const topBySaves = [...recentPosts]
    .sort((a, b) => b.saves - a.saves)
    .slice(0, 3);

  const topByComments = [...recentPosts]
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 3);

  const topByFollowers = [...recentPosts]
    .sort((a, b) => b.engagement - a.engagement) // エンゲージメント率をフォロワー増加の指標として使用
    .slice(0, 3);

  const calculateRate = (value: number, reach: number) => {
    return ((value / reach) * 100).toFixed(2);
  };

  const PostCard = ({ post, metric }: { post: PostInsight; metric: 'likes' | 'saves' | 'comments' | 'followers' }) => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
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
          {metric === 'likes' && <Heart className="w-4 h-4 text-pink-500" />}
          {metric === 'saves' && <Bookmark className="w-4 h-4 text-green-500" />}
          {metric === 'comments' && <MessageCircle className="w-4 h-4 text-blue-500" />}
          {metric === 'followers' && <Users className="w-4 h-4 text-purple-500" />}
          <p className="text-lg font-semibold">
            {metric === 'likes' && post.likes.toLocaleString()}
            {metric === 'saves' && post.saves.toLocaleString()}
            {metric === 'comments' && post.comments.toLocaleString()}
            {metric === 'followers' && `${post.engagement}%`}
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {metric === 'followers' ? (
            'フォロワー増加率'
          ) : (
            `エンゲージメント率: ${
              metric === 'likes' && calculateRate(post.likes, post.reach)
            }${
              metric === 'saves' && calculateRate(post.saves, post.reach)
            }${
              metric === 'comments' && calculateRate(post.comments, post.reach)
            }%`
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          いいね数 TOP3
        </h3>
        <div className="space-y-3">
          {topByLikes.map(post => (
            <PostCard key={post.id} post={post} metric="likes" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          フォロワー増加 TOP3
        </h3>
        <div className="space-y-3">
          {topByFollowers.map(post => (
            <PostCard key={post.id} post={post} metric="followers" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-green-500" />
          保存数 TOP3
        </h3>
        <div className="space-y-3">
          {topBySaves.map(post => (
            <PostCard key={post.id} post={post} metric="saves" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          コメント数 TOP3
        </h3>
        <div className="space-y-3">
          {topByComments.map(post => (
            <PostCard key={post.id} post={post} metric="comments" />
          ))}
        </div>
      </div>
    </div>
  );
}