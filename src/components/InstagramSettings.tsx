import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface InstagramSettings {
  access_token: string;
  business_account_id: string;
}

export function InstagramSettings() {
  const [settings, setSettings] = useState<InstagramSettings>({
    access_token: '',
    business_account_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('instagram_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('設定の読み込みに失敗しました:', error.message);
          setMessage({
            type: 'error',
            text: '設定の読み込みに失敗しました。ページを更新してください。'
          });
        }
        return;
      }

      if (data) {
        setSettings({
          access_token: data.access_token,
          business_account_id: data.business_account_id,
        });
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      setMessage({
        type: 'error',
        text: '設定の読み込みに失敗しました。ページを更新してください。'
      });
    }
  };

  const validateAccessToken = async (token: string): Promise<boolean> => {
    try {
      const cleanToken = token.trim();
      
      // Previous token format validation remains the same...

      // Verify permissions with better error handling
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/permissions?access_token=${encodeURIComponent(cleanToken)}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      const permissionsData = await permissionsResponse.json();
      
      if (!permissionsResponse.ok) {
        if (permissionsData.error) {
          switch (permissionsData.error.code) {
            case 190:
              throw new Error('アクセストークンの有効期限が切れています。新しいトークンを生成してください');
            case 200:
              throw new Error('アプリに必要な権限が付与されていません');
            default:
              throw new Error('権限の検証中にエラーが発生しました');
          }
        }
        throw new Error('権限の検証に失敗しました');
      }

      if (!permissionsData.data) {
        throw new Error('権限情報を取得できませんでした');
      }

      // Define required permissions with labels
      const requiredPermissions = [
        { name: 'instagram_basic', label: 'Instagram基本表示' },
        { name: 'instagram_content_publish', label: 'コンテンツ公開' },
        { name: 'instagram_manage_comments', label: 'コメント管理' },
        { name: 'instagram_manage_insights', label: 'インサイト管理' },
        { name: 'pages_show_list', label: 'Facebookページの表示' },
        { name: 'pages_read_engagement', label: 'エンゲージメントの読み取り' },
        { name: 'business_management', label: 'ビジネス管理' }
      ];

      // Check for missing permissions
      const missingPermissions = requiredPermissions.filter(permission => 
        !permissionsData.data.some((p: any) => 
          p.permission === permission.name && p.status === 'granted'
        )
      );

      if (missingPermissions.length > 0) {
        throw new Error(
          '以下の権限が不足しています：\n\n' +
          missingPermissions.map(p => `• ${p.label}（${p.name}）`).join('\n') +
          '\n\nMeta for Developersで以下の手順を実行してください：\n' +
          '1. Graph API Explorerを開く\n' +
          '2. 右上の「アクセストークンを生成」をクリック\n' +
          '3. 上記の権限を全て選択\n' +
          '4. 新しいトークンを生成して再度お試しください'
        );
      }

      // Additional verification for Instagram permissions
      const instagramResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${encodeURIComponent(cleanToken)}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      const instagramData = await instagramResponse.json();

      if (!instagramResponse.ok) {
        if (instagramData.error) {
          switch (instagramData.error.code) {
            case 190:
              throw new Error('Instagram APIへのアクセスが拒否されました。トークンを再生成してください');
            case 200:
              throw new Error('Instagram APIへのアクセス権限が不足しています');
            default:
              throw new Error('Instagram APIの検証に失敗しました');
          }
        }
        throw new Error('Instagram APIの検証中にエラーが発生しました');
      }

      if (!instagramData.data || instagramData.data.length === 0) {
        throw new Error(
          'Instagramビジネスアカウントが見つかりません。以下を確認してください：\n' +
          '1. Facebookページを作成済みか\n' +
          '2. InstagramアカウントをFacebookページに接続しているか\n' +
          '3. Instagramアカウントがビジネスアカウントか'
        );
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`アクセストークンの検証に失敗しました: ${error.message}`);
      }
      throw new Error('アクセストークンの検証に失敗しました');
    }
  };

  const validateBusinessAccount = async (accountId: string, token: string): Promise<boolean> => {
    try {
      const cleanId = accountId.trim();
      const cleanToken = token.trim();

      if (!cleanId) {
        throw new Error('ビジネスアカウントIDを入力してください');
      }

      if (!/^\d+$/.test(cleanId)) {
        throw new Error('ビジネスアカウントIDは数字のみで入力してください');
      }

      // First, check if we have the required Facebook page permissions
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/permissions?access_token=${encodeURIComponent(cleanToken)}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      const permissionsData = await permissionsResponse.json();

      if (!permissionsResponse.ok) {
        throw new Error('Facebookの権限を確認できません。アクセストークンを確認してください');
      }

      const requiredPagePermissions = ['pages_show_list', 'pages_read_engagement', 'business_management'];
      const missingPagePermissions = requiredPagePermissions.filter(permission => 
        !permissionsData.data?.some((p: any) => p.permission === permission && p.status === 'granted')
      );

      if (missingPagePermissions.length > 0) {
        throw new Error(
          'Facebookページへのアクセスに必要な権限が不足しています。以下の権限が必要です：\n' +
          '• pages_show_list（Facebookページの表示）\n' +
          '• pages_read_engagement（エンゲージメントの読み取り）\n' +
          '• business_management（ビジネス管理）\n\n' +
          'Meta for Developersでアクセストークンを再生成してください。'
        );
      }

      // Then verify Facebook page access and Instagram Business Account connection
      const pageResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account,access_token&access_token=${encodeURIComponent(cleanToken)}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      const pageData = await pageResponse.json();

      if (!pageResponse.ok) {
        if (pageData.error) {
          switch (pageData.error.type) {
            case 'OAuthException':
              throw new Error(
                'Facebookページへのアクセスが拒否されました。以下を確認してください：\n' +
                '1. アプリがFacebookページに接続されているか\n' +
                '2. アプリが公開されているか\n' +
                '3. ページの管理者権限があるか'
              );
            default:
              throw new Error(pageData.error.message || 'Facebookページの取得に失敗しました');
          }
        }
        throw new Error('Facebookページの取得中にエラーが発生しました');
      }

      if (!pageData.data || pageData.data.length === 0) {
        throw new Error(
          'Facebookページが見つかりません。以下を確認してください：\n' +
          '1. Facebookページを作成済みか\n' +
          '2. アプリにページへのアクセス権限を付与しているか\n' +
          '3. ページの管理者権限があるか'
        );
      }

      // Check if any page has the specified Instagram Business Account
      const connectedPage = pageData.data.find((page: any) => 
        page.instagram_business_account?.id === cleanId
      );

      if (!connectedPage) {
        throw new Error(
          'InstagramビジネスアカウントがFacebookページに接続されていません。以下の手順で接続してください：\n' +
          '1. Facebookページの設定を開く\n' +
          '2. 「Instagram」タブを選択\n' +
          '3. 「Instagramアカウントを接続」をクリック\n' +
          '4. プロフェッショナルアカウントを選択して接続'
        );
      }

      // Finally verify Instagram Business Account access
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${encodeURIComponent(cleanId)}?fields=id,username,profile_picture_url&access_token=${encodeURIComponent(cleanToken)}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      const igData = await igResponse.json();

      if (!igResponse.ok) {
        if (igData.error) {
          switch (igData.error.type) {
            case 'OAuthException':
              throw new Error(
                'Instagramビジネスアカウントへのアクセスが拒否されました。以下を確認してください：\n' +
                '1. プロフェッショナルアカウント（ビジネスまたはクリエイター）か\n' +
                '2. Facebookページと正しく接続されているか\n' +
                '3. アプリに必要な権限が付与されているか'
              );
            case 'GraphMethodException':
              throw new Error('Instagramビジネスアカウントへのアクセスに必要な権限が不足しています');
            default:
              throw new Error(igData.error.message || 'ビジネスアカウントIDの検証に失敗しました');
          }
        }
        throw new Error('ビジネスアカウントIDの検証中にエラーが発生しました');
      }

      // Verify Instagram Insights access
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${encodeURIComponent(cleanId)}/insights?metric=impressions,reach&period=day&access_token=${encodeURIComponent(cleanToken)}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      const insightsData = await insightsResponse.json();

      if (!insightsResponse.ok) {
        if (insightsData.error) {
          throw new Error(
            'インサイトへのアクセスが拒否されました。以下を確認してください：\n' +
            '1. instagram_manage_insights権限が付与されているか\n' +
            '2. プロフェッショナルアカウントか\n' +
            '3. アカウントが正しく接続されているか'
          );
        }
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`ビジネスアカウントIDの検証に失敗しました: ${error.message}`);
      }
      throw new Error('ビジネスアカウントIDの検証に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      // Clean and validate inputs
      const cleanToken = settings.access_token.trim();
      const cleanId = settings.business_account_id.trim();

      // Validate access token first
      await validateAccessToken(cleanToken);

      // Then validate business account ID
      await validateBusinessAccount(cleanId, cleanToken);

      // Save settings if both validations pass
      const { error } = await supabase
        .from('instagram_settings')
        .upsert({
          user_id: user.id,
          access_token: cleanToken,
          business_account_id: cleanId,
        });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: '設定を保存しました'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '設定の保存に失敗しました';
      console.error('設定の保存に失敗しました:', errorMessage);
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Instagram API設定</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="access_token" className="block text-sm font-medium text-gray-700">
            アクセストークン
          </label>
          <div className="mt-1">
            <input
              type="password"
              id="access_token"
              value={settings.access_token}
              onChange={(e) => setSettings(prev => ({ ...prev, access_token: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setShowTokenHelp(!showTokenHelp)}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              アクセストークンの取得方法
            </button>
          </div>
          {showTokenHelp && (
            <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
              <h3 className="font-medium text-gray-900 mb-2">アクセストークンの取得手順</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Meta for Developers (<a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">developers.facebook.com</a>) にログイン</li>
                <li>「マイアプリ」から新規アプリを作成
                  <ul className="ml-6 mt-1 list-disc text-gray-500">
                    <li>アプリタイプで「ビジネス」を選択</li>
                    <li>アプリ名を入力して作成</li>
                  </ul>
                </li>
                <li>左メニューから「製品を追加」を選択
                  <ul className="ml-6 mt-1 list-disc text-gray-500">
                    <li>「Instagram Graph API」を追加</li>
                    <li>「基本表示」から設定を開始</li>
                  </ul>
                </li>
                <li>アプリの公開設定を行う
                  <ul className="ml-6 mt-1 list-disc text-gray-500">
                    <li>左メニューから「アプリの公開」を選択</li>
                    <li>「公開する」をクリック</li>
                  </ul>
                </li>
                <li>「ツール」→「Graph API エクスプローラー」を開く</li>
                <li>以下の権限を全て選択:
                  <ul className="ml-6 mt-1 list-disc text-gray-500">
                    <li>instagram_basic（基本表示）</li>
                    <li>instagram_content_publish（コンテンツ公開）</li>
                    <li>instagram_manage_comments（コメント管理）</li>
                    <li>instagram_manage_insights（インサイト管理）</li>
                  </ul>
                </li>
                <li>「アクセストークンを生成」をクリック</li>
                <li>生成されたトークン（EAAから始まる文字列）をコピー</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-yellow-800 font-medium">トラブルシューティング</p>
                <ul className="mt-2 list-disc list-inside text-yellow-700">
                  <li>アプリが公開されていることを確認</li>
                  <li>全ての必要な権限が許可されていることを確認</li>
                  <li>ビジネスアカウントとFacebookページが正しく接続されていることを確認</li>
                </ul>
              </div>
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Meta for Developersで取得したアクセストークンを入力してください（EAAから始まる文字列）
          </p>
        </div>

        <div>
          <label htmlFor="business_account_id" className="block text-sm font-medium text-gray-700">
            ビジネスアカウントID
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="business_account_id"
              value={settings.business_account_id}
              onChange={(e) => setSettings(prev => ({ ...prev, business_account_id: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mt-2 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">ビジネスアカウントIDの確認方法</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Instagramアプリの設定を開く</li>
              <li>「アカウント」→「プロフェッショナルアカウント」を選択</li>
              <li>「アカウント情報」をタップ</li>
              <li>「カテゴリー」の下に表示される数字がビジネスアカウントID</li>
            </ol>
            <p className="mt-3 text-sm text-gray-500">
              ※ プロフェッショナルアカウント（ビジネスまたはクリエイター）である必要があります
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}