'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { knowledgeControllerCreateKnowledge } from '@memorize/api-client';
import { apiClient, getAuthHeaders } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

type ProcessingStep = 'title' | 'chunk' | 'blank' | 'quiz';

export default function NewKnowledgePage() {
  useAuth(); // 认证检查 - 如果未登录会自动跳转到登录页
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('title');

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('请输入知识点内容');
      return;
    }

    setIsProcessing(true);

    try {
      // 模拟 AI 处理流程的视觉反馈
      const steps: ProcessingStep[] = ['title', 'chunk', 'blank', 'quiz'];
      const stepPromise = (async () => {
        for (const step of steps) {
          setCurrentStep(step);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      })();

      // 实际的 API 调用
      const fullContent = title ? `# ${title}\n\n${content}` : content;
      await knowledgeControllerCreateKnowledge({
        client: apiClient,
        body: { content: fullContent },
        headers: getAuthHeaders(),
      });

      // console.debug('🚗🚗🚗', JSON.stringify(res));

      // 等待步骤动画完成
      await stepPromise;

      // 成功后跳转
      router.push('/knowledge');
    } catch (error) {
      console.error('创建知识点失败:', error);
      alert('创建知识点失败，请重试');
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 'title' as ProcessingStep, label: 'AI生成标题中' },
    { id: 'chunk' as ProcessingStep, label: 'AI分块处理中' },
    { id: 'blank' as ProcessingStep, label: 'AI挖空处理中' },
    { id: 'quiz' as ProcessingStep, label: 'AI出题中' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* 导航栏 */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)]">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">新建知识点</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--border)] rounded-md hover:bg-[var(--secondary)] transition-colors"
        >
          返回
        </button>
      </div>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        {/* 表单卡片 */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">填写知识点内容</h2>

          {/* 标题输入框 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题（可留空，AI 将自动生成）"
              className="w-full px-3 py-2.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              disabled={isProcessing}
            />
          </div>

          {/* 内容输入框 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入或粘贴知识点内容..."
              rows={12}
              className="w-full px-3 py-3 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
              disabled={isProcessing}
            />
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '处理中...' : '提交'}
          </button>
        </div>

        {/* AI 处理状态卡片 */}
        {isProcessing && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">AI 处理中</h2>

            {/* 当前步骤 */}
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-[var(--foreground)]">
                当前：{steps.find((s) => s.id === currentStep)?.label}
              </span>
            </div>

            {/* 步骤列表 */}
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
