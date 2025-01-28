import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Repeat, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { ReplySettings, ReplyTiming, ReplyDuration, ReplyLimit } from '../types/instagram';
import { supabase } from '../lib/supabase';

interface DMAutoReplyRule extends ReplySettings {
  id: string;
  enabled: boolean;
}

export function DMAutoReply() {
  const [rules, setRules] = useState<DMAutoReplyRule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<DMAutoReplyRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<ReplySettings>({
    matchText: '',
    matchType: 'exact',
    replyText: '',
    replyType: 'dm',
    replyTiming: '1hour',
    replyDuration: '1day',
    replyLimit: '1'
  });

  useEffect(() => {
    async function loadRules() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('dm_auto_reply_rules')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform snake_case to camelCase
        const transformedData = data?.map(rule => ({
          id: rule.id,
          matchText: rule.match_text,
          matchType: rule.match_type,
          replyText: rule.reply_text,
          replyType: rule.reply_type,
          replyTiming: rule.reply_timing,
          replyDuration: rule.reply_duration,
          replyLimit: rule.reply_limit,
          enabled: rule.enabled
        })) || [];
        
        setRules(transformedData);
      } catch (err) {
        console.error('Failed to load rules:', err);
        setError('ルールの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, []);

  const handleSaveRule = async () => {
    if (!newRule.matchText.trim() || !newRule.replyText.trim()) {
      setError('マッチテキストと返信テキストは必須です');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ユーザーが見つかりません');
        return;
      }

      // Transform camelCase to snake_case for database
      const dbRule = {
        match_text: newRule.matchText,
        match_type: newRule.matchType,
        reply_text: newRule.replyText,
        reply_type: newRule.replyType,
        reply_timing: newRule.replyTiming,
        reply_duration: newRule.replyDuration,
        reply_limit: newRule.replyLimit,
        user_id: user.id,
        enabled: true
      };

      if (editingRule) {
        // 既存のルールを更新
        const { error } = await supabase
          .from('dm_auto_reply_rules')
          .update(dbRule)
          .eq('id', editingRule.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setRules(rules.map(rule =>
          rule.id === editingRule.id
            ? { ...editingRule, ...newRule }
            : rule
        ));
      } else {
        // 新しいルールを作成
        const { data, error } = await supabase
          .from('dm_auto_reply_rules')
          .insert(dbRule)
          .select()
          .single();

        if (error) throw error;
        
        // Transform response data to frontend format
        const newRuleWithId = {
          id: data.id,
          matchText: data.match_text,
          matchType: data.match_type,
          replyText: data.reply_text,
          replyType: data.reply_type,
          replyTiming: data.reply_timing,
          replyDuration: data.reply_duration,
          replyLimit: data.reply_limit,
          enabled: data.enabled
        };
        
        setRules([newRuleWithId, ...rules]);
      }

      setShowRuleModal(false);
      setEditingRule(null);
      setNewRule({
        matchText: '',
        matchType: 'exact',
        replyText: '',
        replyType: 'dm',
        replyTiming: '1hour',
        replyDuration: '1day',
        replyLimit: '1'
      });
      setError(null);
    } catch (err) {
      console.error('Failed to save rule:', err);
      setError('ルールの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleEditRule = (rule: DMAutoReplyRule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setShowRuleModal(true);
    setError(null);
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ユーザーが見つかりません');
        return;
      }

      const { error } = await supabase
        .from('dm_auto_reply_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setRules(rules.filter(rule => rule.id !== id));
    } catch (err) {
      console.error('Failed to delete rule:', err);
      setError('ルールの削除に失敗しました');
    }
  };

  const handleToggleRule = async (id: string) => {
    try {
      const rule = rules.find(r => r.id === id);
      if (!rule) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ユーザーが見つかりません');
        return;
      }

      const { error } = await supabase
        .from('dm_auto_reply_rules')
        .update({
          enabled: !rule.enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setRules(rules.map(r =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ));
    } catch (err) {
      console.error('Failed to toggle rule:', err);
      setError('ルールの更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">DM自動返信設定</h2>
        <button
          onClick={() => {
            setShowRuleModal(true);
            setEditingRule(null);
            setNewRule({
              matchText: '',
              matchType: 'exact',
              replyText: '',
              replyType: 'dm',
              replyTiming: '1hour',
              replyDuration: '1day',
              replyLimit: '1'
            });
            setError(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規ルール作成
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {rules.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">自動返信ルールが設定されていません</p>
            <button
              onClick={() => {
                setShowRuleModal(true);
                setEditingRule(null);
                setError(null);
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              ルールを作成
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <li key={rule.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {rule.matchText}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rule.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.enabled ? '有効' : '無効'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{rule.replyText}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {rule.replyTiming === '1hour' ? '1時間後' :
                             rule.replyTiming === '3hours' ? '3時間後' :
                             rule.replyTiming === '6hours' ? '6時間後' : '12時間後'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {rule.replyDuration === '1day' ? '1日間' :
                             rule.replyDuration === '3days' ? '3日間' :
                             rule.replyDuration === '7days' ? '7日間' :
                             rule.replyDuration === '30days' ? '30日間' : '無期限'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {rule.replyLimit === '1' ? '1回のみ' : '無制限'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`p-2 rounded-md ${
                          rule.enabled
                            ? 'text-gray-400 hover:text-gray-500'
                            : 'text-indigo-600 hover:text-indigo-700'
                        }`}
                      >
                        {rule.enabled ? '無効化' : '有効化'}
                      </button>
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-2 text-gray-400 hover:text-gray-500"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRule ? 'ルールを編集' : '新規ルール作成'}
              </h3>
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  マッチテキスト
                </label>
                <input
                  type="text"
                  value={newRule.matchText}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    matchText: e.target.value
                  }))}
                  placeholder="例: 商品について"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  マッチタイプ
                </label>
                <div className="mt-2 flex gap-4">
                  <button
                    onClick={() => setNewRule(prev => ({
                      ...prev,
                      matchType: 'exact'
                    }))}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      newRule.matchType === 'exact'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    完全一致
                  </button>
                  <button
                    onClick={() => setNewRule(prev => ({
                      ...prev,
                      matchType: 'contains'
                    }))}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      newRule.matchType === 'contains'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    部分一致
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  返信メッセージ
                </label>
                <textarea
                  value={newRule.replyText}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    replyText: e.target.value
                  }))}
                  placeholder="自動返信メッセージを入力"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返信タイミング
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
                      onClick={() => setNewRule(prev => ({
                        ...prev,
                        replyTiming: timing.value as ReplyTiming
                      }))}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                        newRule.replyTiming === timing.value
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返信期間
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
                      onClick={() => setNewRule(prev => ({
                        ...prev,
                        replyDuration: duration.value as ReplyDuration
                      }))}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                        newRule.replyDuration === duration.value
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返信制限
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '1', label: '1回のみ' },
                    { value: 'unlimited', label: '無制限' }
                  ].map((limit) => (
                    <button
                      key={limit.value}
                      onClick={() => setNewRule(prev => ({
                        ...prev,
                        replyLimit: limit.value as ReplyLimit
                      }))}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md ${
                        newRule.replyLimit === limit.value
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRuleModal(false);
                    setEditingRule(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveRule}
                  disabled={saving || !newRule.matchText.trim() || !newRule.replyText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : editingRule ? '更新' : '作成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}