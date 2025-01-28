import React, { useState } from 'react';
import { Users, Heart, Eye, Bookmark, UserCircle, Link2, Phone, Image, X, Download } from 'lucide-react';
import { TimeSeriesMetric, PostInsight } from '../types/instagram';

interface AccountMetricsProps {
  data: TimeSeriesMetric[];
}

export function AccountMetrics({ data }: AccountMetricsProps) {
  const [selectedPost, setSelectedPost] = useState<PostInsight | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  
  // 選択された年月のデータを取得
  const monthData = data.filter(item => {
    const date = new Date(item.date);
    return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatDateForCSV = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatValue = (value: number, includeSign: boolean = true) => {
    const prefix = includeSign && value > 0 ? '+' : '';
    return `${prefix}${value.toLocaleString()}`;
  };

  const calculateDailyChange = (current: number, previous: number) => {
    return current - previous;
  };

  const calculateRate = (value: number, reach: number) => {
    return ((value / reach) * 100).toFixed(2);
  };

  // 年の選択肢を生成（現在の年から3年前まで）
  const years = Array.from(
    { length: 4 },
    (_, i) => selectedYear - i
  );

  // 月の選択肢を生成
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // CSV出力機能
  const exportToCSV = () => {
    // ヘッダー行
    const headers = [
      '日付',
      '投稿数',
      'フォロー数増減',
      'いいね数増減',
      'インプレッション数増減',
      '保存数増減',
      'プロフィール閲覧数増減',
      'ウェブサイトクリック数増減',
      '連絡手段クリック数増減'
    ];

    // データ行の生成
    const csvData = monthData.map((day, index) => {
      const previousDay = index > 0 ? monthData[index - 1] : null;
      return [
        formatDateForCSV(day.date),
        day.posts?.length || 0,
        previousDay ? calculateDailyChange(day.followers, previousDay.followers) : 0,
        previousDay ? calculateDailyChange(day.likes, previousDay.likes) : 0,
        previousDay ? calculateDailyChange(day.impressions, previousDay.impressions) : 0,
        previousDay ? calculateDailyChange(day.saves, previousDay.saves) : 0,
        previousDay ? calculateDailyChange(day.profileViews, previousDay.profileViews) : 0,
        previousDay ? calculateDailyChange(day.websiteClicks, previousDay.websiteClicks) : 0,
        previousDay ? calculateDailyChange(day.contactClicks, previousDay.contactClicks) : 0
      ];
    });

    // CSVデータの作成
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // BOMを追加してExcelで文字化けを防ぐ
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `instagram-metrics-${selectedYear}-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">投稿の詳細</h3>
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
                    <p className="text-sm text-gray-500">投稿日</p>
                    <p className="text-base font-medium">
                      {new Date(selectedPost.posted).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">いいね</p>
                      <p className="text-lg font-semibold">{selectedPost.likes.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedPost.likes, selectedPost.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">コメント</p>
                      <p className="text-lg font-semibold">{selectedPost.comments.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedPost.comments, selectedPost.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">保存</p>
                      <p className="text-lg font-semibold">{selectedPost.saves.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        Rate: {calculateRate(selectedPost.saves, selectedPost.reach)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">リーチ</p>
                      <p className="text-lg font-semibold">{selectedPost.reach.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">エンゲージメント率</p>
                    <p className="text-lg font-semibold">{selectedPost.engagement}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">アカウントメトリクス</h2>
            <p className="mt-1 text-sm text-gray-500">日別推移（前日比）</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                年:
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="block w-28 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="month-select" className="text-sm font-medium text-gray-700">
                月:
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV出力
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日付
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  投稿
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  フォロー数
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  いいね数
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  インプレッション数
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  保存数
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <UserCircle className="w-4 h-4" />
                  プロフィール閲覧数
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Link2 className="w-4 h-4" />
                  ウェブサイトクリック数
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  連絡手段クリック数
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthData.map((day, index) => {
              const previousDay = index > 0 ? monthData[index - 1] : null;
              return (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(day.date)}
                  </td>
                  <td className="px-6 py-4">
                    {day.posts && day.posts.length > 0 ? (
                      <div className="flex -space-x-2">
                        {day.posts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className="relative hover:z-10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                          >
                            <img
                              src={post.imageUrl}
                              alt="Post"
                              className="w-8 h-8 rounded-full ring-2 ring-white object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {previousDay && (
                      <div className={`text-sm ${
                        calculateDailyChange(day.followers, previousDay.followers) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatValue(calculateDailyChange(day.followers, previousDay.followers))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {previousDay && (
                      <div className={`text-sm ${
                        calculateDailyChange(day.likes, previousDay.likes) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatValue(calculateDailyChange(day.likes, previousDay.likes))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {previousDay && (
                      <div className={`text-sm ${
                        calculateDailyChange(day.impressions, previousDay.impressions) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatValue(calculateDailyChange(day.impressions, previousDay.impressions))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {previousDay && (
                      <div className={`text-sm ${
                        calculateDailyChange(day.saves, previousDay.saves) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatValue(calculateDailyChange(day.saves, previousDay.saves))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {previousDay && (
                      <div className={`text-sm ${
                        calculateDailyChange(day.profileViews, previousDay.profileViews) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatValue(calculateDailyChange(day.profileViews, previousDay.profileViews))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {previousDay && (
                      <div className={`text-sm ${
                        calculateDailyChange(day.websiteClicks, previousDay.websiteClicks) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatValue(calculateDailyChange(day.websiteClicks, previousDay.websiteClicks))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {previousDay && (
                      <div className={`text-sm ${
                        calculateDailyChange(day.contactClicks, previousDay.contactClicks) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatValue(calculateDailyChange(day.contactClicks, previousDay.contactClicks))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}