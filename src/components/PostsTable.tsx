import React, { useState, useEffect } from 'react';
import { PostInsight } from '../types/instagram';
import { ArrowUpDown, ArrowUp, ArrowDown, X, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { PostMetricsGraph } from './PostMetricsGraph';
import { supabase } from '../lib/supabase';

interface PostsTableProps {
  posts: PostInsight[];
}

type SortField = 'likes' | 'comments' | 'saves' | 'reach' | 'engagement' | 'posted' | 'likeRate' | 'commentRate' | 'saveRate' | 'followerContribution';
type SortDirection = 'asc' | 'desc';

type MatchType = 'exact' | 'contains';
type ReplyType = 'comment' | 'dm';

interface ReplySettings {
  matchText: string;
  matchType: MatchType;
  replyText: string;
  replyType: ReplyType;
}

export function PostsTable({ posts }: PostsTableProps) {
  const [sortField, setSortField] = useState<SortField>('posted');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedPost, setSelectedPost] = useState<PostInsight | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showReplySettings, setShowReplySettings] = useState<string | null>(null);
  const [replySettingsMap, setReplySettingsMap] = useState<Record<string, ReplySettings>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReplySettings();
  }, []);

  const loadReplySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('post_reply_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const settingsMap: Record<string, ReplySettings> = {};
      data?.forEach(setting => {
        settingsMap[setting.post_id] = {
          matchText: setting.match_text,
          matchType: setting.match_type as MatchType,
          replyText: setting.reply_text,
          replyType: setting.reply_type as ReplyType
        };
      });

      setReplySettingsMap(settingsMap);
    } catch (error) {
      console.error('Error loading reply settings:', error);
    }
  };

  const handleSaveReplySettings = async (postId: string) => {
    const settings = replySettingsMap[postId];
    if (!settings) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_reply_settings')
        .upsert({
          post_id: postId,
          user_id: user.id,
          match_text: settings.matchText,
          match_type: settings.matchType,
          reply_text: settings.replyText,
          reply_type: settings.replyType
        }, {
          onConflict: 'post_id,user_id'
        });

      if (error) throw error;
      setShowReplySettings(null);
    } catch (error) {
      console.error('Error saving reply settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const calculateRate = (value: number, reach: number) => {
    return ((value / reach) * 100).toFixed(2);
  };

  const calculateFollowerContribution = (posted: string) => {
    return (Math.random() * 2).toFixed(2);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'likes':
        return (a.likes - b.likes) * multiplier;
      case 'comments':
        return (a.comments - b.comments) * multiplier;
      case 'saves':
        return (a.saves - b.saves) * multiplier;
      case 'reach':
        return (a.reach - b.reach) * multiplier;
      case 'engagement':
        return (a.engagement - b.engagement) * multiplier;
      case 'likeRate':
        return ((a.likes / a.reach) - (b.likes / b.reach)) * multiplier;
      case 'commentRate':
        return ((a.comments / a.reach) - (b.comments / b.reach)) * multiplier;
      case 'saveRate':
        return ((a.saves / a.reach) - (b.saves / b.reach)) * multiplier;
      case 'followerContribution':
        return (parseFloat(calculateFollowerContribution(a.posted)) - parseFloat(calculateFollowerContribution(b.posted))) * multiplier;
      case 'posted':
        return (new Date(a.posted).getTime() - new Date(b.posted).getTime()) * multiplier;
      default:
        return 0;
    }
  });

  const renderSortableHeader = (field: SortField, label: string) => (
    <th 
      className="w-[8.33%] px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group sticky top-0 bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="break-words">{label}</span>
        <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {getSortIcon(field)}
        </span>
      </div>
    </th>
  );

  const ReplySettingsModal = ({ postId }: { postId: string }) => {
    const settings = replySettingsMap[postId] || {
      matchText: '',
      matchType: 'exact' as MatchType,
      replyText: '',
      replyType: 'comment' as ReplyType
    };

    const updateSettings = (updates: Partial<ReplySettings>) => {
      setReplySettingsMap(prev => ({
        ...prev,
        [postId]: { ...settings, ...updates }
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Reply Settings</h3>
            <button
              onClick={() => setShowReplySettings(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Analysis Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Match Text
                  </label>
                  <input
                    type="text"
                    value={settings.matchText}
                    onChange={(e) => updateSettings({ matchText: e.target.value })}
                    placeholder="e.g., Question about the product"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Match Type
                  </label>
                  <div className="mt-2 flex gap-4">
                    <button
                      onClick={() => updateSettings({ matchType: 'exact' })}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        settings.matchType === 'exact'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Match All
                    </button>
                    <button
                      onClick={() => updateSettings({ matchType: 'contains' })}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        settings.matchType === 'contains'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Contains
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Reply Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reply Text
                  </label>
                  <textarea
                    value={settings.replyText}
                    onChange={(e) => updateSettings({ replyText: e.target.value })}
                    placeholder="Enter your reply message"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reply Type
                  </label>
                  <div className="mt-2 flex gap-4">
                    <button
                      onClick={() => updateSettings({ replyType: 'comment' })}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        settings.replyType === 'comment'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Reply to Comment
                    </button>
                    <button
                      onClick={() => updateSettings({ replyType: 'dm' })}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        settings.replyType === 'dm'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Reply to DM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowReplySettings(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveReplySettings(postId)}
                disabled={!settings.matchText.trim() || !settings.replyText.trim() || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Post Details</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedPost.imageUrl}
                  alt="Post"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Posted on</p>
                    <p className="text-base font-medium">
                      {new Date(selectedPost.posted).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Likes</p>
                      <p className="text-lg font-semibold">{selectedPost.likes.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedPost.likes, selectedPost.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Comments</p>
                      <p className="text-lg font-semibold">{selectedPost.comments.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedPost.comments, selectedPost.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Saves</p>
                      <p className="text-lg font-semibold">{selectedPost.saves.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedPost.saves, selectedPost.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reach</p>
                      <p className="text-lg font-semibold">{selectedPost.reach.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engagement Rate</p>
                    <p className="text-lg font-semibold">{selectedPost.engagement}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReplySettings && <ReplySettingsModal postId={showReplySettings} />}

      <div className="overflow-x-auto max-h-[600px]">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[8.33%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                <span className="break-words">Post</span>
              </th>
              {renderSortableHeader('engagement', 'Engagement')}
              {renderSortableHeader('followerContribution', 'Follower Growth')}
              {renderSortableHeader('likes', 'Likes')}
              {renderSortableHeader('likeRate', 'Like Rate')}
              {renderSortableHeader('comments', 'Comments')}
              {renderSortableHeader('commentRate', 'Comment Rate')}
              {renderSortableHeader('saves', 'Saves')}
              {renderSortableHeader('saveRate', 'Save Rate')}
              {renderSortableHeader('reach', 'Impressions')}
              {renderSortableHeader('posted', 'Date')}
              <th className="w-[8.33%] px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                <span className="break-words">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPosts.map((post) => (
              <React.Fragment key={post.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                      >
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="h-12 w-12 object-cover rounded-lg hover:opacity-75 transition-opacity"
                        />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {post.engagement}%
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {calculateFollowerContribution(post.posted)}%
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {post.likes.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {calculateRate(post.likes, post.reach)}%
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {post.comments.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {calculateRate(post.comments, post.reach)}%
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {post.saves.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {calculateRate(post.saves, post.reach)}%
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {post.reach.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    {new Date(post.posted).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 text-center">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setShowReplySettings(post.id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Reply
                      </button>
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        {expandedPost === post.id ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedPost === post.id && (
                  <tr>
                    <td colSpan={12} className="bg-gray-50 px-3 py-4">
                      <PostMetricsGraph data={generateMetricsData(post)} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}