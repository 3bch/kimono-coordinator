import { removeBackground } from "@imgly/background-removal";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/** 市松模様(透過確認用)の背景スタイル */
const checkerStyle: React.CSSProperties = {
  backgroundImage: "repeating-conic-gradient(#d1d5db 0% 25%, #ffffff 0% 50%)",
  backgroundSize: "16px 16px",
};

/**
 * 背景透過の検証状態
 */
type BgTestState =
  | { status: "pending" }
  | { status: "done"; url: string; elapsedMs: number }
  | { status: "error"; message: string };

/**
 * 検証状態を表示用の文字列に変換する
 * @param state 検証状態
 * @returns 状態を表す文字列
 */
const statusLabel = (state: BgTestState): string => {
  if (state.status === "pending") {
    return "処理中…";
  }
  if (state.status === "error") {
    return `エラー: ${state.message}`;
  }
  return `完了 ${Math.round(state.elapsedMs)}ms`;
};

/**
 * `@imgly/background-removal` の切り抜き品質と処理時間を確認する試験用ページ
 * @returns 元画像と透過結果を並べて表示する React 要素
 */
const BgTestPage = () => {
  const [state, setState] = useState<BgTestState>({ status: "pending" });

  useEffect(() => {
    const objectUrls: string[] = [];
    let cancelled = false;

    // 相対パスを removeBackground に直接渡すとライブラリの publicPath (CDN)
    // 基準で解決されてしまうため、先に fetch して Blob として渡す
    const run = async () => {
      const response = await fetch("/obidome-sample.jpg");
      const blob = await response.blob();
      const start = performance.now();
      const result = await removeBackground(blob);
      const url = URL.createObjectURL(result);
      objectUrls.push(url);
      if (!cancelled) {
        setState({ status: "done", url, elapsedMs: performance.now() - start });
      }
    };
    run().catch((cause: unknown) => {
      if (!cancelled) {
        setState({ status: "error", message: String(cause) });
      }
    });

    return () => {
      cancelled = true;
      for (const url of objectUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-xl font-bold">@imgly/background-removal 検証</h1>
      <p data-testid="status">{statusLabel(state)}</p>
      <div className="flex flex-wrap gap-8">
        <figure>
          <figcaption>元画像</figcaption>
          <img src="/obidome-sample.jpg" alt="帯留めの元画像" width={400} />
        </figure>
        {state.status === "done" && (
          <figure>
            <figcaption>透過結果</figcaption>
            <div style={checkerStyle}>
              <img src={state.url} alt="背景透過済みの帯留め" width={400} />
            </div>
          </figure>
        )}
      </div>
    </div>
  );
};

/**
 * 背景透過検証ページのルート定義(検証用の一時ページ)
 */
export const Route = createFileRoute("/bg-test")({ component: BgTestPage });
