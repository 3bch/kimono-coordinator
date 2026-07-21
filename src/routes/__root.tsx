import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

/**
 * アプリケーションのルートレイアウトコンポーネント
 * 全ページで共通のレイアウトと開発ツールを提供する
 * @returns ルートレイアウトの React 要素
 */
const RootLayout = () => (
  <div className="min-h-screen bg-pink-100">
    <Outlet />
    <TanStackRouterDevtools />
  </div>
);

/**
 * TanStack Router のルートルート設定
 * アプリケーション全体のルートレイアウトを定義
 */
export const Route = createRootRoute({ component: RootLayout });
