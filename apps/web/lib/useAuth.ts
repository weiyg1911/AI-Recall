import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from './auth';

/**
 * 认证路由白名单
 */
const AUTH_WHITELIST = ['/login', '/health'];

/**
 * 认证 Hook - 用于保护需要登录的页面
 *
 * @param redirectTo - 登录后重定向的路径，默认为当前路径
 */
export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getToken();
  const isAuthenticated = !!token;

  useEffect(() => {
    // 如果当前路由不在白名单中且用户未登录，则跳转到登录页
    if (!AUTH_WHITELIST.includes(pathname) && !isAuthenticated) {
      const loginPath = `/login?redirect=${encodeURIComponent(redirectTo || pathname)}`;
      router.push(loginPath);
    }
  }, [isAuthenticated, pathname, redirectTo, router]);

  return { isAuthenticated, token };
}

/**
 * 登录后跳转 Hook - 用于登录页面处理登录成功后的跳转
 */
export function useLoginRedirect() {
  const router = useRouter();

  /**
   * 处理登录成功后的跳转
   */
  const handleLoginSuccess = () => {
    // 检查 URL 参数中是否有 redirect 参数
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');

    if (redirectParam) {
      // 如果有 redirect 参数，跳转到指定页面
      router.push(decodeURIComponent(redirectParam));
    } else {
      // 否则跳转到首页
      router.push('/');
    }
  };

  return { handleLoginSuccess };
}
