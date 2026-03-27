'use client';

import { useState } from 'react';
import {
  authControllerSendOtp,
  authControllerVerifyOtp,
  type SendOtpDto,
  type VerifyOtpDto,
} from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useLoginRedirect } from '@/lib/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [_codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState<'send' | 'login' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { handleLoginSuccess } = useLoginRedirect();

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('请输入邮箱');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading('send');
    try {
      const body: SendOtpDto = { email: trimmed };
      await authControllerSendOtp({
        body,
        throwOnError: true,
      });
      setCodeSent(true);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : '发送验证码失败');
    } finally {
      setLoading(null);
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
    if (!trimmedEmail) {
      setError('请输入邮箱');
      return;
    }
    if (!trimmedCode) {
      setError('请输入验证码');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading('login');
    try {
      const body: VerifyOtpDto = { email: trimmedEmail, code: trimmedCode };
      const data = (await authControllerVerifyOtp({
        body,
        throwOnError: true,
      })) as unknown as { result: boolean; token?: string };
      if (data?.token) setToken(data.token);
      setSuccess('登录成功，正在跳转...');

      // 延迟跳转以显示成功消息
      setTimeout(() => {
        handleLoginSuccess();
      }, 500);
    } catch (e) {
      setError(e instanceof Error ? e.message : '验证码错误或已过期');
    } finally {
      setLoading(null);
    }
  };

  const sendDisabled = loading === 'send' || countdown > 0;
  const loginDisabled = loading === 'login';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-sans"
      style={{ background: 'var(--background)' }}
    >
      {/* formCard: width 400, padding 32, gap 24, rounded 8, shadow, border */}
      <div
        className="w-full max-w-[400px] rounded-lg flex flex-col gap-6 p-8 border"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
          登录
        </h1>

        <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          邮箱
        </label>
        <input
          type="email"
          placeholder="请输入邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!loading}
          className="w-full h-10 px-3 py-2.5 rounded-md text-sm border box-border disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          style={{
            background: 'var(--background)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        />

        <label className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          验证码
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={!!loading}
            maxLength={6}
            className="flex-1 h-10 px-3 py-2.5 rounded-md text-sm border box-border disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sendDisabled}
            className="h-10 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 transition-opacity"
            style={{
              background: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
            }}
          >
            {countdown > 0 ? `${countdown}s 后重发` : loading === 'send' ? '发送中…' : '发送验证码'}
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          验证码将发送至您的邮箱，有效期 5 分钟
        </p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loginDisabled}
          className="w-full h-10 py-2.5 px-6 rounded-md text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 transition-opacity"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          {loading === 'login' ? '登录中…' : '登录'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <p className="text-[13px] mt-2" style={{ color: 'var(--muted-foreground)' }}>
          <a href="/" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
            返回首页
          </a>
        </p>
      </div>
    </div>
  );
}
