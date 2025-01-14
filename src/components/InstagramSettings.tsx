import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
        // PGRST116は設定が存在しない場合のエラーなので無視
        if (error.code !== 'PGRST116') {
          console.error('設定の読み込みに失敗しました:', error.message, error);
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
      if (error instanceof Error) {
        console.error('設定の読み込みに失敗しました:', error.message);
      } else {
        console.error('設定の読み込みに失敗しました:', error);
      }
      setMessage({
        type: 'error',
        text: '設定の読み込みに失敗しました。ページを更新してください。'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      // Instagram APIの接続テスト
      const testResponse = await fetch(
        `https://graph.facebook.com/v18.0/${settings.business_account_id}?fields=id,username&access_token=${settings.access_token}`
      );

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        throw new Error(
          errorData.error?.message || 'Instagram APIの接続に失敗しました'
        );
      }

      // 設定を保存
      const { error } = await supabase
        .from('instagram_settings')
        .upsert({
          user_id: user.id,
          access_token: settings.access_token,
          business_account_id: settings.business_account_id,
        });

      if (error) {
        console.error('設定の保存に失敗しました:', error.message, error);
        throw error;
      }

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
          <input
            type="password"
            id="access_token"
            value={settings.access_token}
            onChange={(e) => setSettings(prev => ({ ...prev, access_token: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Meta for Developersで取得したアクセストークンを入力してください
          </p>
        </div>

        <div>
          <label htmlFor="business_account_id" className="block text-sm font-medium text-gray-700">
            ビジネスアカウントID
          </label>
          <input
            type="text"
            id="business_account_id"
            value={settings.business_account_id}
            onChange={(e) => setSettings(prev => ({ ...prev, business_account_id: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            InstagramビジネスアカウントのIDを入力してください
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
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