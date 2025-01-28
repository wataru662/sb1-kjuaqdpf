import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, X, ChevronDown, ChevronUp, MessageSquare, Clock, Calendar, Repeat, Download } from 'lucide-react';
import { PostMetricsGraph } from './PostMetricsGraph';
import { PostInsight, ReplySettings, ReplyTiming, ReplyDuration, ReplyLimit, MatchType, ReplyType } from '../types/instagram';
import { generatePostsCSV, downloadCSV } from '../utils/csvExport';

interface StoriesTableProps {
  stories: PostInsight[];
}

type SortField = 'likes' | 'comments' | 'saves' | 'reach' | 'engagement' | 'posted' | 'likeRate' | 'commentRate' | 'saveRate' | 'followerContribution';
type SortDirection = 'asc' | 'desc';

export function StoriesTable({ stories }: StoriesTableProps) {
  const [sortField, setSortField] = useState<SortField>('posted');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedStory, setSelectedStory] = useState<PostInsight | null>(null);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [showReplySettings, setShowReplySettings] = useState(false);
  const [replySettings, setReplySettings] = useState<ReplySettings>({
    matchText: '',
    matchType: 'exact',
    replyText: '',
    replyType: 'comment',
    replyTiming: '1hour',
    replyDuration: '1day',
    replyLimit: '1'
  });

  const calculateRate = (value: number, reach: number) => {
    return ((value / reach) * 100).toFixed(2);
  };

  const calculateFollowerContribution = (posted: string) => {
    return (Math.random() * 2).toFixed(2);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSaveReplySettings = () => {
    console.log('Saving reply settings:', replySettings);
    setShowReplySettings(false);
  };

  const handleExportCSV = () => {
    const csvContent = generatePostsCSV(sortedStories);
    downloadCSV(csvContent, `instagram-stories-${new Date().toISOString().split('T')[0]}.csv`);
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

  const sortedStories = [...stories].sort((a, b) => {
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
      className="w-[8.33%] px-3 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group bg-gray-50 sticky top-0 z-10"
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

  return (
    <div className="relative">
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Story Details</h3>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedStory.imageUrl}
                  alt="Story"
                  className="w-full aspect-[9/16] object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Posted on</p>
                    <p className="text-base font-medium">
                      {new Date(selectedStory.posted).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Likes</p>
                      <p className="text-lg font-semibold">{selectedStory.likes.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedStory.likes, selectedStory.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Comments</p>
                      <p className="text-lg font-semibold">{selectedStory.comments.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedStory.comments, selectedStory.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Saves</p>
                      <p className="text-lg font-semibold">{selectedStory.saves.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedStory.saves, selectedStory.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reach</p>
                      <p className="text-lg font-semibold">{selectedStory.reach.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Engagement Rate</p>
                    <p className="text-lg font-semibold">{selectedStory.engagement}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReplySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Reply Settings</h3>
              <button
                onClick={() => setShowReplySettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Analysis Area */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Analysis Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Match Text
                    </label>
                    <input
                      type="text"
                      value={replySettings.matchText}
                      onChange={(e) => setReplySettings(prev => ({
                        ...prev,
                        matchText: e.target.value
                      }))}
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
                        onClick={() => setReplySettings(prev => ({
                          ...prev,
                          matchType: 'exact'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          replySettings.matchType === 'exact'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Match All
                      </button>
                      <button
                        onClick={() => setReplySettings(prev => ({
                          ...prev,
                          matchType: 'contains'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          replySettings.matchType === 'contains'
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

              {/* Reply Area */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Reply Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reply Text
                    </label>
                    <textarea
                      value={replySettings.replyText}
                      onChange={(e) => setReplySettings(prev => ({
                        ...prev,
                        replyText: e.target.value
                      }))}
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
                        onClick={() => setReplySettings(prev => ({
                          ...prev,
                          replyType: 'comment'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          replySettings.replyType === 'comment'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Reply to Comment
                      </button>
                      <button
                        onClick={() => setReplySettings(prev => ({
                          ...prev,
                          replyType: 'dm'
                        }))}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          replySettings.replyType === 'dm'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Reply to DM
                      </button>
                    </div>
                  </div>

                  {/* Reply Timing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply Timing
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '1hour', label: '1時間後' },
                        { value: '3hours', label: '3時間後' },
                        { value: '6hours', label: '6時間後' },
                        { value: '12hours', label: '12時間後' }
                      ].map((timing) => (
                        <button
                          key={timing.value}
                          onClick={() => setReplySettings(prev => ({
                            ...prev,
                            replyTiming: timing.value as ReplyTiming
                          }))}
                          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                            replySettings.replyTiming === timing.value
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {timing.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reply Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply Duration
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '1day', label: '1日間' },
                        { value: '3days', label: '3日間' },
                        { value: '7days', label: '7日間' },
                        { value: '30days', label: '30日間' },
                        { value: 'unlimited', label: '無期限' }
                      ].map((duration) => (
                        <button
                          key={duration.value}
                          onClick={() => setReplySettings(prev => ({
                            ...prev,
                            replyDuration: duration.value as ReplyDuration
                          }))}
                          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                            replySettings.replyDuration === duration.value
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          {duration.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reply Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply Limit
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '1', label: '1回のみ' },
                        { value: 'unlimited', label: '無制限' }
                      ].map((limit) => (
                        <button
                          key={limit.value}
                          onClick={() => setReplySettings(prev => ({
                            ...prev,
                            replyLimit: limit.value as ReplyLimit
                          }))}
                          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                            replySettings.replyLimit === limit.value
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Repeat className="w-4 h-4" />
                          {limit.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowReplySettings(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReplySettings}
                  disabled={!replySettings.matchText.trim() || !replySettings.replyText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="w-4 h-4 mr-2" />
          CSVダウンロード
        </button>
      </div>

      <div className="relative rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: '1800px' }}>
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[8.33%] px-3 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 z-10">
                  <span className="break-words">Story</span>
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
                <th className="w-[8.33%] px-3 py-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 z-10">
                  <span className="break-words">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedStories.map((story) => (
                <React.Fragment key={story.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-8">
                      <div className="flex items-center">
                        <button
                          onClick={() => setSelectedStory(story)}
                          className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                        >
                          <img
                            src={story.imageUrl}
                            alt="Story"
                            className="h-24 w-24 object-cover rounded-lg hover:opacity-75 transition-opacity"
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{story.engagement}%</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{calculateFollowerContribution(story.posted)}%</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{story.likes.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{calculateRate(story.likes, story.reach)}%</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{story.comments.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{calculateRate(story.comments, story.reach)}%</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{story.saves.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{calculateRate(story.saves, story.reach)}%</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{story.reach.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <span className="text-lg">{new Date(story.posted).toLocaleDateString()}</span>
                    </td>
                    <td className="px-3 py-8 text-sm text-gray-900 text-center">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setShowReplySettings(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Reply
                        </button>
                        <button
                          onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          {expandedStory === story.id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedStory === story.id && (
                    <tr>
                      <td colSpan={12} className="bg-gray-50 px-3 py-8">
                        <PostMetricsGraph data={[]} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}