import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Algebra Balance Lab", () => {
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
});
