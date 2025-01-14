import React, { useState } from 'react';
import { signIn, signUp, resetPassword } from '../lib/supabase';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'パスワードは6文字以上である必要があります';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmationMessage(null);
    setLoading(true);

    try {
      if (isResetPassword) {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setConfirmationMessage(
          'パスワードリセットのメールを送信しました。メール内のリンクからパスワードを再設定してください。'
        );
        setEmail('');
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
          } else if (error.message === 'Email not confirmed') {
            throw new Error('メールアドレスが確認されていません。確認メールをご確認ください');
          }
          throw error;
        }
      } else {
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('weak_password')) {
            throw new Error('パスワードは6文字以上である必要があります');
          } else if (error.message.includes('User already registered')) {
            setIsLogin(true);
            throw new Error(
              'このメールアドレスは既に登録されています。ログインしてください。'
            );
          }
          throw error;
        }
        setConfirmationMessage(
          'ご登録ありがとうございます。確認メールを送信しましたので、メール内のリンクをクリックして登録を完了してください。'
        );
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
    setConfirmationMessage(null);
  };

  const switchMode = (mode: 'login' | 'signup' | 'reset') => {
    setIsLogin(mode === 'login');
    setIsResetPassword(mode === 'reset');
    clearError();
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isResetPassword ? 'パスワードリセット' : isLogin ? 'ログイン' : '新規登録'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isResetPassword
              ? 'パスワードリセット用のメールを送信します'
              : isLogin
              ? '登録がまだの方は新規登録をしてください'
              : '既に登録済みの方はログインしてください'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
              />
            </div>
            {!isResetPassword && (
              <div>
                <label htmlFor="password" className="sr-only">
                  パスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="パスワード（6文字以上）"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {confirmationMessage && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md">
              {confirmationMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading
                ? 'Loading...'
                : isResetPassword
                ? 'パスワードリセットメールを送信'
                : isLogin
                ? 'ログイン'
                : '新規登録'}
            </button>
          </div>

          <div className="flex flex-col items-center space-y-2">
            {isLogin && (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                パスワードをお忘れの方はこちら
              </button>
            )}
            <button
              type="button"
              onClick={() => switchMode(isResetPassword ? 'login' : isLogin ? 'signup' : 'login')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isResetPassword
                ? 'ログインに戻る'
                : isLogin
                ? '新規登録はこちら'
                : 'ログインはこちら'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}