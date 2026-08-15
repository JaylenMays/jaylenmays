import { test, expect } from "@playwright/test";

/**
 * End-to-end smoke tests. Requires a seeded database (npm run db:seed) so the
 * demo user jaylen@setischolar.dev exists.
 */

const DEMO_EMAIL = "jaylen@setischolar.dev";
const DEMO_PASSWORD = "ad-astra-2026";

test("unauthenticated visitors are redirected to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText("SETI Scholar")).toBeVisible();
});

test("login → dashboard → core sections", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  await expect(page.getByText("Mission Control")).toBeVisible();
  await expect(page.getByText("Become a SETI astrophysicist")).toBeVisible();

  // Roadmap
  await page.goto("/roadmap");
  await expect(page.getByRole("heading", { name: "Degree Roadmap" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Astrophysics Preparation Pathway/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /ASU APS \(Astrophysics\) BS — Official/ }),
  ).toBeVisible();

  // Learning studio
  await page.goto("/studio");
  await expect(page.getByRole("heading", { name: "Learning Studio" })).toBeVisible();
  await expect(page.getByText("Calculus I Preparation").first()).toBeVisible();

  // A lesson renders markdown content
  await page.goto("/studio/limits-and-notation");
  await expect(page.getByRole("heading", { name: /Limits & Mathematical Notation/ }).first()).toBeVisible();

  // Review
  await page.goto("/review");
  await expect(page.getByRole("heading", { name: "Spaced Repetition" })).toBeVisible();
});

test("AI tutor replies (offline fallback without API keys)", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await page.goto("/tutor");
  await page.getByPlaceholder(/Ask about math/).fill("How do I get better at limits?");
  await page.getByRole("button", { name: "Send" }).click();
  // Offline tutor always returns a structured study plan.
  await expect(page.getByText(/Define every term|offline tutor mode/i).first()).toBeVisible({
    timeout: 20000,
  });
});

test("course builder: autonomous pipeline builds a cited curriculum", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await page.goto("/builder");
  await expect(page.getByRole("heading", { name: "Course Builder" })).toBeVisible();
  await expect(page.getByText("Review pipeline")).toBeVisible();

  // Build the Calculus I curriculum and wait for the pipeline to finish
  // (the button disables while the server-side build runs).
  const buildButton = page.getByRole("button", { name: /curriculum for MAT 265/ });
  await buildButton.click();
  await expect(buildButton).toBeEnabled({ timeout: 120_000 });
  await expect(page.getByText("curriculum ready").first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("link", { name: /Open curriculum for MAT 265/ }).click();

  // Curriculum detail: lessons with citations, books, sources, disagreements.
  await expect(page.getByText(/Auto-built preparation curriculum/)).toBeVisible();
  await expect(page.getByText("Diagnostic exam", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("machine-validated").first()).toBeVisible();
  await expect(page.getByText(/Sources cited/).first()).toBeVisible();

  await page.getByRole("tab", { name: /Books/ }).click();
  await expect(page.getByText("OpenStax").first()).toBeVisible();
  await expect(page.getByText(/Why selected/).first()).toBeVisible();

  await page.getByRole("tab", { name: /Sources/ }).click();
  await expect(page.getByText(/Source history/).first()).toBeVisible();

  await page.getByRole("tab", { name: /Disagreements/ }).click();
  await expect(page.getByText(/How to handle it/).first()).toBeVisible();
});

test("quiz round-trip: start, answer, grade", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await page.goto("/quiz");
  await page.getByRole("button", { name: "Start" }).first().click();
  await expect(page.getByText(/Question 1 of/)).toBeVisible({ timeout: 10000 });

  // Answer every question (always pick option A).
  for (;;) {
    await page.locator("button", { hasText: /^A/ }).first().click();
    const next = page.getByRole("button", { name: "Next", exact: true });
    if (await next.isVisible().catch(() => false)) {
      await next.click();
    } else {
      await page.getByRole("button", { name: "Submit for grading" }).click();
      break;
    }
  }
  await expect(page.getByText(/correct/)).toBeVisible({ timeout: 10000 });
});
