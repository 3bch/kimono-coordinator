import { KimonoView } from "#src/components/KimonoView";
import { sampleKimonos, sampleObis } from "#src/data/sampleData";
import { createFileRoute } from "@tanstack/react-router";

/**
 * TanStack Router のルート "/" のルート設定
 * アプリケーションのトップページを定義
 */
export const Route = createFileRoute("/(root)/")({
  component: Index,
});

/**
 * トップページコンポーネント
 * 着物コーディネーターのメイン画面を表示
 * @returns トップページの React 要素
 */
function Index() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 p-4">
      <h1 className="text-center text-2xl font-bold">Kimono Coordinator</h1>
      <p className="text-center text-sm text-gray-600">着物と帯の組み合わせをお試しください</p>

      <KimonoView kimonos={sampleKimonos} obis={sampleObis} />
    </div>
  );
}
