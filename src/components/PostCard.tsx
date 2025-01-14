import React from 'react';
import { Heart, MessageCircle, Bookmark, Eye } from 'lucide-react';
import { PostInsight } from '../types/instagram';

interface PostCardProps {
  post: PostInsight;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <img 
        src={post.imageUrl} 
        alt="Post" 
        className="w-full aspect-square object-cover"
      />
      <div className="p-2">
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-gray-600" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-gray-600" />
            <span>{post.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-gray-600" />
            <span>{post.saves}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-600" />
            <span>{post.reach}</span>
          </div>
        </div>
        <div className="mt-1 pt-1 border-t">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-500">
              {new Date(post.posted).toLocaleDateString()}
            </span>
            <span className="font-medium text-indigo-600">
              {post.engagement}% Eng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}