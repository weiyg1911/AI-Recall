'use client';

import { useState } from 'react';
import {
  healthControllerCheckHealth,
  healthControllerPing,
} from '@memorize/api-client';
import { apiClient } from '@/lib/api';

export default function Home() {
  const [healthResult, setHealthResult] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<'health' | 'ping' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setError(null);
    setHealthResult(null);
    setLoading('health');
    try {
      const result = await healthControllerCheckHealth({ client: apiClient });
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
      const result = await healthControllerPing({ client: apiClient });
      setPingResult(typeof result === 'string' ? result : JSON.stringify(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : '请求失败');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 560 }}>
      <h1 style={{ marginBottom: 24 }}>背书记忆 · 后端连通检查</h1>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          type="button"
          onClick={checkHealth}
          disabled={loading !== null}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
          }}
        >
          {loading === 'health' ? '检查中…' : 'Health 检查'}
        </button>
        <button
          type="button"
          onClick={checkPing}
          disabled={loading !== null}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
          }}
        >
          {loading === 'ping' ? '检查中…' : 'Ping 检查'}
        </button>
      </div>
      {error && (
        <pre style={{ color: '#c00', background: '#fee', padding: 12, borderRadius: 8, overflow: 'auto' }}>
          {error}
        </pre>
      )}
      {healthResult != null && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Health 结果</h2>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, overflow: 'auto', fontSize: 14 }}>
            {healthResult}
          </pre>
        </section>
      )}
      {pingResult != null && (
        <section>
          <h2 style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Ping 结果</h2>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, overflow: 'auto', fontSize: 14 }}>
            {pingResult}
          </pre>
        </section>
      )}
    </div>
  );
}
