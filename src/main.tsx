import "#src/main.css";

import { routeTree } from "#src/routeTree.gen";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/**
 * TanStack Router のルーターインスタンス
 * ルートツリーから生成されたルーティング設定を使用
 */
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/**
 * アプリケーションのルート DOM 要素
 * index.html の #root 要素を取得
 */
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

/**
 * React のルートインスタンス
 * アプリケーションのレンダリングを管理
 */
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
