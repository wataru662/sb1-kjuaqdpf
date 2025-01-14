import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Comment } from '../types/instagram';

interface CommentManagerProps {
  comments: Comment[];
}

export function CommentManager({ comments }: CommentManagerProps) {
  // Get the last 5 comments, sorted by timestamp in descending order
  const latestComments = [...comments]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Comment Management</h2>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-600">
            Latest {latestComments.length} of {comments.length} Comments
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {latestComments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-900">@{comment.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{comment.text}</p>
            {comment.aiReply && (
              <div className="mt-2 pl-4 border-l-2 border-indigo-200">
                <p className="text-sm font-medium text-indigo-600 mb-1">Previous Reply:</p>
                <p className="text-sm text-gray-600">{comment.aiReply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}