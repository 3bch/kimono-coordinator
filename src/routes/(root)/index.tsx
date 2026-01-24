import { KimonoView } from "#src/components/KimonoView";
import { sampleKimonos, sampleObis } from "#src/data/sampleData";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(root)/")({
  component: Index,
});

function Index() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 p-4">
      <h1 className="text-center text-2xl font-bold">Kimono Coordinator</h1>
      <p className="text-center text-sm text-gray-600">着物と帯の組み合わせをお試しください</p>

      <KimonoView kimonos={sampleKimonos} obis={sampleObis} />
    </div>
  );
}
