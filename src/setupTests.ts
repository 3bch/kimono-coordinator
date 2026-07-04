import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom は window.scrollTo を実装しておらず、TanStack Router が
// ナビゲーション時に呼び出すと警告が出るためスタブに差し替える
window.scrollTo = vi.fn<() => void>();

afterEach(() => {
  cleanup();
});
