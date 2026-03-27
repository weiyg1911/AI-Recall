'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { knowledgeControllerGetKnowledgeList } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { clearToken } from '@/lib/auth';

interface InfoItem {
  type: 'text' | 'cloze';
  content: string;
  id: string;
}

interface Knowledge {
  id: string;
  title: string;
  infoList: InfoItem[];
  createdAt: string;
  updatedAt: string;
}

// 渲染 infoList 内容，cloze 类型显示带下划线
function renderInfoList(infoList: InfoItem[]) {
  return (
    <span>
      {infoList.map((item) => (
        <span
          key={item.id}
          style={
            item.type === 'cloze'
              ? {
                  borderBottom: '2px solid var(--primary)',
                  paddingBottom: '2px',
                  margin: '0 2px',
                  color: 'var(--foreground)',
                }
              : {
                  color: 'var(--muted-foreground)',
                }
          }
        >
          {item.content}
        </span>
      ))}
    </span>
  );
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
}

export default function KnowledgeListPage() {
  useAuth(); // 认证检查
  const router = useRouter();

  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(true);

  // 获取知识点列表
  const fetchKnowledgeList = async (_page: number = 1) => {
    setLoading(true);
    try {
      const response = (await knowledgeControllerGetKnowledgeList()) as unknown as Knowledge[];
      setKnowledgeList(response || []);
      setPagination({
        total: response?.length || 0,
        page: 1,
        pageSize: 10,
      });
    } catch (error) {
      // 如果是认证错误，清除token并跳转到登录页
      if (error instanceof Error && error.message.includes('401')) {
        clearToken();
        router.push('/login?redirect=' + encodeURIComponent('/knowledge'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchKnowledgeList(page);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
    fetchKnowledgeList(1);
  };

  // 处理刷新按钮点击
  const handleRefresh = () => {
    fetchKnowledgeList(pagination.page);
  };

  // 处理新建按钮点击
  const handleNewKnowledge = () => {
    router.push('/knowledge/new');
  };

  // 处理退出登录
  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  // 处理编辑操作
  const handleEdit = (id: string) => {
    router.push(`/knowledge/edit/${id}`);
  };

  // 渲染分页按钮
  const renderPaginationButtons = () => {
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const buttons = [];

    // 上一页
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
        className="px-3 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
      >
        上一页
      </button>,
    );

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= pagination.page - 1 && i <= pagination.page + 1)) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className="px-3 py-2 text-sm rounded-md"
            style={{
              background: i === pagination.page ? 'var(--primary)' : 'var(--background)',
              color: i === pagination.page ? 'var(--primary-foreground)' : 'var(--foreground)',
              border: i === pagination.page ? 'none' : '1px solid var(--border)',
            }}
          >
            {i}
          </button>,
        );
      } else if (i === pagination.page - 2 || i === pagination.page + 2) {
        buttons.push(
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            ...
          </span>,
        );
      }
    }

    // 下一页
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.page + 1)}
        disabled={pagination.page === totalPages}
        className="px-3 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
      >
        下一页
      </button>,
    );

    return buttons;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* 导航栏 */}
      <div
        className="flex items-center justify-between px-8 py-6 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
            }}
            title="刷新列表"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            知识点列表
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleNewKnowledge}
            className="px-4 py-2 text-sm font-medium rounded-md transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            新建
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-md border transition-opacity hover:opacity-90"
            style={{
              background: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="px-8 py-8">
        {/* 表格 */}
        <div
          className="rounded-lg border"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--primary)' }}
              />
            </div>
          ) : knowledgeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                暂无知识点数据
              </p>
              <button
                onClick={handleNewKnowledge}
                className="px-4 py-2 text-sm font-medium rounded-md transition-opacity hover:opacity-90"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                创建第一个知识点
              </button>
            </div>
          ) : (
            <>
              {/* 表头 */}
              <div
                className="flex items-center gap-4 px-4 py-3 border-b"
                style={{
                  background: 'var(--muted)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="text-sm font-semibold"
                  style={{ width: '200px', color: 'var(--foreground)' }}
                >
                  标题
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ flex: 1, color: 'var(--foreground)' }}
                >
                  内容
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ width: '180px', color: 'var(--foreground)' }}
                >
                  更新时间
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ width: '80px', color: 'var(--foreground)' }}
                >
                  操作
                </div>
              </div>

              {/* 数据行 */}
              {knowledgeList.map((knowledge) => (
                <div
                  key={knowledge.id}
                  className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{ width: '200px', color: 'var(--foreground)' }}
                  >
                    {knowledge.title}
                  </div>
                  <div
                    className="text-sm"
                    style={{ flex: 1, color: 'var(--foreground)', lineHeight: '1.8' }}
                  >
                    {renderInfoList(knowledge.infoList)}
                  </div>
                  <div
                    className="text-sm"
                    style={{ width: '180px', color: 'var(--muted-foreground)' }}
                  >
                    {new Date(knowledge.updatedAt).toLocaleString('zh-CN')}
                  </div>
                  <div
                    className="text-sm cursor-pointer hover:underline"
                    style={{ width: '80px', color: 'var(--primary)' }}
                    onClick={() => handleEdit(knowledge.id)}
                  >
                    编辑
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* 分页 */}
        {!loading && knowledgeList.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div
              className="flex items-center gap-6 text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <span>共 {pagination.total} 条</span>
              <div className="flex items-center gap-2">
                <span>每页</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-2 py-1 text-sm rounded border"
                  style={{
                    background: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>条</span>
              </div>
            </div>

            <div className="flex gap-2">{renderPaginationButtons()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
