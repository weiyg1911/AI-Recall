'use client';

import { useState, useEffect } from 'react';
import {
  healthControllerCheckHealth,
  healthControllerPing,
  healthControllerGetServerTime,
  healthControllerErrorException,
  authControllerSendOtp,
  authControllerVerifyOtp,
  type SendOtpDto,
  type VerifyOtpDto,
} from '@/lib/api';
import { getToken, setToken, clearToken } from '@/lib/auth';

const btnStyle = {
  padding: '10px 20px',
  fontSize: 16,
  cursor: 'pointer',
  background: '#111',
  color: '#fff',
  border: 'none' as const,
  borderRadius: 8,
};

export default function HealthPage() {
  const [healthResult, setHealthResult] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [errorExceptionResult, setErrorExceptionResult] = useState<string | null>(null);
  const [authTimeResult, setAuthTimeResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<
    'health' | 'ping' | 'errorException' | 'authTime' | 'sendOtp' | 'login' | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [_codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  const checkHealth = async () => {
    setError(null);
    setHealthResult(null);
    setLoading('health');
    try {
      const result = await healthControllerCheckHealth();
      setHealthResult(JSON.stringify(result, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败');
    } finally {
      setLoading(null);
    }
  };

  const checkPing = async () => {
    setError(null);
    setPingResult(null);
    setLoading('ping');
    try {
      const result = await healthControllerPing();
      setPingResult(typeof result === 'string' ? result : JSON.stringify(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败');
    } finally {
      setLoading(null);
    }
  };

  const triggerErrorException = async () => {
    setError(null);
    setErrorExceptionResult(null);
    setLoading('errorException');
    try {
      await healthControllerErrorException({ throwOnError: true });
      setErrorExceptionResult('未抛出错误（不应出现）');
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e !== null
            ? JSON.stringify(e, null, 2)
            : String(e);
      setErrorExceptionResult(msg);
    } finally {
      setLoading(null);
    }
  };

  const checkAuthTime = async () => {
    setError(null);
    setAuthTimeResult(null);
    setLoading('authTime');
    try {
      const result = await healthControllerGetServerTime({
        throwOnError: true,
      });
      setAuthTimeResult(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (e) {
      setAuthTimeResult(e instanceof Error ? e.message : '请求失败');
    } finally {
      setLoading(null);
    }
  };

  const handleClearToken = () => {
    clearToken();
    setTokenState(null);
    setAuthTimeResult(null);
    setError(null);
  };

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('请输入邮箱');
      return;
    }
    setError(null);
    setLoading('sendOtp');
    try {
      const body: SendOtpDto = { email: trimmed };
      await authControllerSendOtp({ body, throwOnError: true });
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
    setLoading('login');
    try {
      const body: VerifyOtpDto = { email: trimmedEmail, code: trimmedCode };
      const data = (await authControllerVerifyOtp({
        body,
        throwOnError: true,
      })) as unknown as { data: { result: boolean; token?: string } };
      if (data.data.result && data.data.token) {
        setToken(data.data.token);
        setTokenState(data.data.token);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '验证码错误或已过期');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 560 }}>
      <h1 style={{ marginBottom: 24 }}>背书记忆 · 后端连通检查</h1>

      {/* 登录状态与 Token 操作 */}
      <section style={{ marginBottom: 24, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
        <h2 style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>登录 / Token</h2>
        <p style={{ marginBottom: 12, fontSize: 14 }}>
          {token ? '已登录（已保存 token）' : '未登录'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            type="button"
            onClick={checkAuthTime}
            disabled={loading !== null}
            style={btnStyle}
          >
            {loading === 'authTime' ? '验证中…' : '验证 authTime'}
          </button>
          <button
            type="button"
            onClick={handleClearToken}
            disabled={!token}
            style={{
              ...btnStyle,
              background: '#c00',
              opacity: !token ? 0.6 : 1,
              cursor: !token ? 'not-allowed' : 'pointer',
            }}
          >
            清除 token
          </button>
        </div>
        {authTimeResult != null && (
          <p style={{ fontSize: 14, color: '#333' }}>
            authTime 结果：<strong>{authTimeResult}</strong>
          </p>
        )}
      </section>

      {/* 登录表单 */}
      <section style={{ marginBottom: 24, padding: 16, background: '#f0f8ff', borderRadius: 8 }}>
        <h2 style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>登录接口</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320 }}>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 10, fontSize: 14, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                padding: 10,
                fontSize: 14,
                borderRadius: 6,
                border: '1px solid #ccc',
                flex: 1,
              }}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading !== null || countdown > 0}
              style={{ ...btnStyle, whiteSpace: 'nowrap' }}
            >
              {countdown > 0 ? `${countdown}s` : loading === 'sendOtp' ? '发送中…' : '发送验证码'}
            </button>
          </div>
          <button type="button" onClick={handleLogin} disabled={loading !== null} style={btnStyle}>
            {loading === 'login' ? '登录中…' : '登录'}
          </button>
        </div>
      </section>

      {/* Health / Ping */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>健康检查</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={checkHealth}
            disabled={loading !== null}
            style={{ ...btnStyle, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'health' ? '检查中…' : 'Health 检查'}
          </button>
          <button
            type="button"
            onClick={checkPing}
            disabled={loading !== null}
            style={{ ...btnStyle, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading === 'ping' ? '检查中…' : 'Ping 检查'}
          </button>
          <button
            type="button"
            onClick={triggerErrorException}
            disabled={loading !== null}
            style={{
              ...btnStyle,
              background: '#a30',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading === 'errorException' ? '请求中…' : '触发 errorException'}
          </button>
        </div>
      </section>

      {error && (
        <pre
          style={{
            color: '#c00',
            background: '#fee',
            padding: 12,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          {error}
        </pre>
      )}
      {healthResult != null && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Health 结果</h2>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 14,
            }}
          >
            {healthResult}
          </pre>
        </section>
      )}
      {pingResult != null && (
        <section>
          <h2 style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Ping 结果</h2>
          <pre
            style={{
              background: '#f5f5f5',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 14,
            }}
          >
            {pingResult}
          </pre>
        </section>
      )}
      {errorExceptionResult != null && (
        <section style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>errorException 结果</h2>
          <pre
            style={{
              background: '#fff4f0',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 14,
              color: '#333',
            }}
          >
            {errorExceptionResult}
          </pre>
        </section>
      )}
    </div>
  );
}
