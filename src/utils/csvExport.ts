import { PostInsight } from '../types/instagram';

export function generatePostsCSV(posts: PostInsight[]) {
  // ヘッダー行
  const headers = [
    '投稿日',
    'エンゲージメント率',
    'フォロワー増加率',
    'いいね数',
    'いいね率',
    'コメント数',
    'コメント率',
    '保存数',
    '保存率',
    'インプレッション数',
    '画像URL'
  ];

  // データ行の生成
  const rows = posts.map(post => {
    const calculateRate = (value: number) => ((value / post.reach) * 100).toFixed(2);
    const followerContribution = (Math.random() * 2).toFixed(2); // Demo data

    return [
      new Date(post.posted).toLocaleDateString('ja-JP'),
      `${post.engagement}%`,
      `${followerContribution}%`,
      post.likes,
      `${calculateRate(post.likes)}%`,
      post.comments,
      `${calculateRate(post.comments)}%`,
      post.saves,
      `${calculateRate(post.saves)}%`,
      post.reach,
      post.imageUrl
    ];
  });

  // CSVデータの作成
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string) {
  // BOMを追加してExcelで文字化けを防ぐ
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}