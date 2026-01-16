import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(root)/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Kimono Coordinator!</h3>
    </div>
  );
}
