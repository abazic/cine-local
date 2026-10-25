import { test, expect } from "@playwright/test";

test("katalog tampil dan kartu membuka halaman detail", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const firstCard = page.locator('a[href^="/title/"]').first();
  await expect(firstCard).toBeVisible();

  const href = await firstCard.getAttribute("href");
  await firstCard.click();

  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator("h1").first()).not.toBeEmpty();
});

test("pencarian mengembalikan hasil", async ({ page }) => {
  await page.goto("/search?q=the", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href^="/title/"]').first()).toBeVisible();
});

test("membuka detail mencatat riwayat", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const href = await page
    .locator('a[href^="/title/"]')
    .first()
    .getAttribute("href");

  await page.goto(href!, { waitUntil: "domcontentloaded" });

  // Tunggu sampai HistoryTracker benar-benar menulis ke localStorage.
  // h1 tidak cukup sebagai tanda, karena HTML dari server sudah terlihat sebelum hydrate.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem("cine-local:history") ?? "[]";
        return JSON.parse(raw).length;
      })
    )
    .toBeGreaterThan(0);

  await page.goto("/history", { waitUntil: "domcontentloaded" });
  await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
});
