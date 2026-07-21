import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("golden-path smoke test", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Public Meeting Follow-Up Kit" })).toBeVisible();
  await expect(page.getByLabel("Public agenda")).toBeVisible();
  await expect(page.getByText("Ready for human review").first()).toBeVisible();

  await page.getByRole("tab", { name: "Actions" }).click();
  await expect(page.locator("pre").getByText(/Action tracker/i)).toBeVisible();
  await expect(
    page.locator("pre").getByText(/Publish a plain-language meeting summary/i),
  ).toBeVisible();

  await page.getByRole("tab", { name: "FAQ" }).click();
  await expect(page.getByText(/Was a final decision made at the meeting/i)).toBeVisible();

  await page.getByRole("tab", { name: "Comms" }).click();
  await expect(page.locator("pre").getByText(/Follow-up communication plan/i)).toBeVisible();

  await page.getByRole("button", { name: "Blank draft" }).click();
  await expect(page.getByText("Needs source material").first()).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export" }).click();
  expect((await download).suggestedFilename()).toBe("public-meeting-follow-up-kit.json");
});

test("health endpoint reports ready", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ status: "ok" });
});

test("home page has no automatically detectable serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
});
