import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  const originalWidth = window.innerWidth;
  const originalHash = window.location.hash;
  const originalResizeObserver = globalThis.ResizeObserver;
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth
    });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${originalHash}`);
    globalThis.ResizeObserver = originalResizeObserver;
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("renders a phone blocker on small viewports", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 640
    });

    render(<App />);
    expect(screen.getByText(/tablet or desktop required/i)).toBeInTheDocument();
  });

  it("bypasses the phone blocker when godmode is present in the hash", () => {
    window.history.replaceState(null, "", "#godmode=x");
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 640
    });
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
    HTMLCanvasElement.prototype.getContext = ((() => {
      const noop = () => {};
      return new Proxy(
        {},
        {
          get: (_, property) => {
            if (property === "measureText") {
              return () => ({ width: 0 });
            }
            return noop;
          }
        }
      ) as CanvasRenderingContext2D;
    }) as unknown) as typeof HTMLCanvasElement.prototype.getContext;

    render(<App />);
    expect(screen.getByRole("heading", { name: "Isometric Drawing Tool" })).toBeInTheDocument();
  });
});
