import { expect, test } from "@playwright/test";

test("practice waits and learn mode shows graph updates", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Algebra Balance Lab" })).toBeVisible();

  await page.getByRole("button", { name: "Practice" }).click();
  await expect(page.getByText("Nothing to draw yet")).toBeVisible();

  await page.getByRole("button", { name: "Learn" }).click();
  await expect(page.getByRole("heading", { name: "Where the line hits the target" })).toBeVisible();

  await page.getByRole("button", { name: "Pro" }).click();
  await expect(page.getByRole("heading", { name: "One point fits both lines" })).toBeVisible();
  await expect(page.locator(".reduction-grid .reduction-block").first()).toContainText("X-only reduction");
});
