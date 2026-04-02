'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  knowledgeControllerGetKnowledgeDetail,
  knowledgeControllerUpdateKnowledge,
} from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { clearToken } from '@/lib/auth';

type ProcessingStep = 'title' | 'chunk' | 'blank' | 'quiz';

interface InfoItem {
  type: 'text' | 'cloze';
  content: string;
}

interface KnowledgeDetail {
  id: string;
  title: string;
  infoList: InfoItem[];
}

function unwrapRecord<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function infoListToContent(items: InfoItem[] | undefined): string {
  if (!items?.length) return '';
  return items.map((i) => i.content).join('');
}

export default function EditKnowledgePage() {
  useAuth();
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('title');

  const loadDetail = useCallback(async () => {
    if (!id) {
      setLoadError('无效的知识点');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const raw = await knowledgeControllerGetKnowledgeDetail({ body: { id } });
      const doc = unwrapRecord<KnowledgeDetail>(raw);
      if (!doc || typeof doc !== 'object') {
        throw new Error('加载失败');
      }
      setTitle(doc.title ?? '');
      setContent(infoListToContent(doc.infoList));
    } catch (e) {
      if (e instanceof Error && e.message.includes('401')) {
        clearToken();
        router.push('/login?redirect=' + encodeURIComponent(`/knowledge/edit/${id}`));
        return;
      }
      setLoadError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('请输入知识点内容');
      return;
    }
    setIsProcessing(true);
    try {
      const steps: ProcessingStep[] = ['title', 'chunk', 'blank', 'quiz'];
      const stepPromise = (async () => {
        for (const step of steps) {
          setCurrentStep(step);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      })();
      await knowledgeControllerUpdateKnowledge({
        body: {
          id,
          content,
          ...(title.trim() ? { title: title.trim() } : {}),
        },
      });
      await stepPromise;
      router.push('/knowledge');
    } catch (error) {
      console.error('更新知识点失败:', error);
      alert('保存失败，请重试');
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 'title' as ProcessingStep, label: 'AI生成标题中' },
    { id: 'chunk' as ProcessingStep, label: 'AI分块处理中' },
    { id: 'blank' as ProcessingStep, label: 'AI挖空处理中' },
    { id: 'quiz' as ProcessingStep, label: 'AI出题中' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--background)] px-8">
        <p className="text-sm text-[var(--muted-foreground)]">{loadError}</p>
        <button
          type="button"
          onClick={() => router.push('/knowledge')}
          className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--border)] text-[var(--foreground)]"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)]">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">编辑知识点</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded-md hover:bg-[var(--secondary)] transition-colors"
        >
          返回
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">编辑知识点内容</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="已有标题（可直接修改）"
              className="w-full px-3 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此修改知识点正文，支持 Markdown…"
              rows={12}
              className="w-full px-3 py-3 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
              disabled={isProcessing}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '处理中...' : '保存'}
          </button>
        </div>

        {isProcessing && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">AI 处理中</h2>

            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                当前：{steps.find((s) => s.id === currentStep)?.label}
              </span>
            </div>

            <div className="space-y-2">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const stepIndex = steps.findIndex((s) => s.id === step.id);
                const currentIndex = steps.findIndex((s) => s.id === currentStep);
                const isCompleted = stepIndex < currentIndex;

                return (
                  <div key={step.id} className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-sm ${
                        isActive || isCompleted
                          ? 'bg-[var(--primary)]'
                          : 'bg-[var(--muted-foreground)]'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isActive
                          ? 'font-medium text-[var(--primary)]'
                          : isCompleted
                            ? 'font-normal text-[var(--foreground)]'
                            : 'font-normal text-[var(--muted-foreground)]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">以上步骤将循环展示当前处理状态</p>
          </div>
        )}
      </div>
    </div>
  );
}
