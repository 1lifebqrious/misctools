import { expect, test } from "@playwright/test";

test("renders the editor on desktop", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Isometric Drawing Tool" })).toBeVisible();
  await expect(page.getByLabel("Isometric drawing canvas")).toBeVisible();
});

test("blocks phone-sized screens", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByText(/tablet or desktop required/i)).toBeVisible();
  await context.close();
});
