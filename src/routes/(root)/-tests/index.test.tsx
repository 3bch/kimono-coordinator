import { routeTree } from "#src/routeTree.gen";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const router = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

describe("root route", () => {
  it("renders the root index page", async () => {
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("Kimono Coordinator")).toBeInTheDocument();
  });

  it("renders kimono and obi sections", async () => {
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("着物")).toBeInTheDocument();
    expect(await screen.findByText("帯")).toBeInTheDocument();
  });
});
