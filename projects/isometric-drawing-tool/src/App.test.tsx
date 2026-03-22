import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders a phone blocker on small viewports", () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 640
    });

    render(<App />);
    expect(screen.getByText(/tablet or desktop required/i)).toBeInTheDocument();

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth
    });
  });
});
