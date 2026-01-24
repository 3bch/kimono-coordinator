import { SwipeableItem } from "#src/components/SwipeableItem";
import { sampleKimonos, sampleObis } from "#src/data/sampleData";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(root)/")({
  component: Index,
});

function Index() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-4">
      <h1 className="text-center text-2xl font-bold">Kimono Coordinator</h1>
      <p className="text-center text-sm text-gray-600">
        左右にスワイプして着物と帯を選んでください
      </p>

      <SwipeableItem items={sampleKimonos} label="着物" height="250px" />

      <SwipeableItem items={sampleObis} label="帯" height="120px" />
    </div>
  );
}
