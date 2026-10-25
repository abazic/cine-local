import { test, expect, type Page } from "@playwright/test";

async function openFirstDetail(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const href = await page
    .locator('a[href^="/title/"]')
    .first()
    .getAttribute("href");
  await page.goto(href!, { waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", { name: /Tambah ke Daftar Saya/ })
    .waitFor({ state: "visible" });
  return href!;
}

async function pollWatchlist(page: Page, expected: "filled" | "empty") {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const raw = localStorage.getItem("cine-local:watchlist") ?? "[]";
          return JSON.parse(raw).length;
        }),
      { timeout: 8000 }
    )
    [expected === "filled" ? "toBeGreaterThan" : "toBe"](0);
}

test("tombol tambah menyimpan dan muncul di watchlist", async ({ page }) => {
  const href = await openFirstDetail(page);
  await page.getByRole("button", { name: /Tambah ke Daftar Saya/ }).click();
  await pollWatchlist(page, "filled");
  await expect(
    page.getByRole("button", { name: /Ada di Daftar Saya/ })
  ).toBeVisible();
  await page.goto("/watchlist", { waitUntil: "domcontentloaded" });
  await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
});

test("tombol hapus menghilangkan dari watchlist", async ({ page }) => {
  const href = await openFirstDetail(page);
  await page.getByRole("button", { name: /Tambah ke Daftar Saya/ }).click();
  await pollWatchlist(page, "filled");
  await page.getByRole("button", { name: /Ada di Daftar Saya/ }).click();
  await pollWatchlist(page, "empty");
  await expect(
    page.getByRole("button", { name: /Tambah ke Daftar Saya/ })
  ).toBeVisible();
  await page.goto("/watchlist", { waitUntil: "domcontentloaded" });
  await expect(page.locator(`a[href="${href}"]`)).toHaveCount(0);
});

