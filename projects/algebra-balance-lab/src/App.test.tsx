import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Algebra Balance Lab", () => {
  const originalWidth = window.innerWidth;
  const originalHash = window.location.hash;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth
    });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${originalHash}`);
  });

  it("opens the tutorial", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Tutorial" }));
    expect(screen.getByRole("dialog", { name: /why equations turn into graphs/i })).toBeInTheDocument();
  });

  it("keeps the practice graph hidden until check passes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Practice" }));
    expect(screen.getByText(/nothing to draw yet/i)).toBeInTheDocument();
  });

  it("switches to pro mode and shows the reduced view", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Pro" }));
    expect(
      screen.getByText((_, element) => element?.textContent === "X-only reduction")
    ).toBeInTheDocument();
    expect(screen.getByText(/one point fits both lines/i)).toBeInTheDocument();
  });

  it("bypasses the phone blocker when godmode is present in the hash", () => {
    window.history.replaceState(null, "", "#godmode=x");
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 640
    });

    render(<App />);
    expect(screen.getByRole("heading", { name: "Algebra Balance Lab" })).toBeInTheDocument();
  });
});
