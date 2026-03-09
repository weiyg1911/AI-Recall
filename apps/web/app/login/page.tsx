'use client';

import { useState } from 'react';
import {
  authControllerSendOtp,
  authControllerVerifyOtp,
  type SendOtpDto,
  type VerifyOtpDto,
} from '@memorize/api-client';
import { apiClient } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [_codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState<'send' | 'login' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        client: apiClient,
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
        client: apiClient,
        body,
        throwOnError: true,
      })) as unknown as { result: boolean; token?: string };
      if (data?.token) setToken(data.token);
      setSuccess('登录成功');
    } catch (e) {
      setError(e instanceof Error ? e.message : '验证码错误或已过期');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ marginBottom: 24, fontSize: 22, fontWeight: 600 }}>登录</h1>

        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#333' }}>
          邮箱
        </label>
        <input
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!loading}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 14px',
            fontSize: 16,
            border: '1px solid #ddd',
            borderRadius: 8,
            marginBottom: 16,
          }}
        />

        <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: '#333' }}>
          验证码
        </label>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={!!loading}
            maxLength={6}
            style={{
              flex: 1,
              padding: '12px 14px',
              fontSize: 16,
              border: '1px solid #ddd',
              borderRadius: 8,
            }}
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading === 'send' || countdown > 0}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              whiteSpace: 'nowrap',
              cursor: countdown > 0 || loading === 'send' ? 'not-allowed' : 'pointer',
              background: countdown > 0 ? '#ccc' : '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
            }}
          >
            {countdown > 0 ? `${countdown}s 后重发` : loading === 'send' ? '发送中…' : '获取验证码'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading === 'login'}
          style={{
            width: '100%',
            padding: 14,
            fontSize: 16,
            fontWeight: 500,
            cursor: loading === 'login' ? 'not-allowed' : 'pointer',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
          }}
        >
          {loading === 'login' ? '登录中…' : '登录'}
        </button>

        {error && <p style={{ marginTop: 16, color: '#c00', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ marginTop: 16, color: '#0a0', fontSize: 14 }}>{success}</p>}

        <p style={{ marginTop: 24, fontSize: 13, color: '#888' }}>
          <a href="/" style={{ color: '#666' }}>
            返回首页
          </a>
        </p>
      </div>
    </div>
  );
}
