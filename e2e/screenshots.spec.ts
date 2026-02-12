import { test, expect, Page } from '@playwright/test';

const API_BASE = '**/api/v1';

async function mockAgeCheck(page: Page, isMinor: boolean) {
  await page.route(`${API_BASE}/auth/check-age`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ is_minor: isMinor, age: isMinor ? 15 : 30, server_date: '2026-02-12' }),
    });
  });
}

async function fillBasicInfo(page: Page, birthDate: string) {
  await page.locator('#firstName').fill('Γιώργος');
  await page.locator('#lastName').fill('Παπαδόπουλος');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#phone').fill('6901234567');
  await page.locator('#birthDate').fill(birthDate);
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Άνδρας' }).click();
  await page.waitForTimeout(500);
  await page.locator('#password').fill('Secure1234!');
  await page.locator('#confirmPassword').fill('Secure1234!');
}

async function clickContinue(page: Page) {
  const btn = page.getByRole('button', { name: 'Συνέχεια' });
  await btn.scrollIntoViewIfNeeded();
  await btn.dispatchEvent('click');
}

test.describe('Screenshot captures for GitHub issues', () => {

  // #35 #37 #38 - Login page fixes (eye icon, centering, icon visibility)
  test('login-page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });

    // Focus email to show icons don't disappear
    await page.locator('#email').fill('test@test.com');
    await page.locator('#password').fill('testpass');
    await page.screenshot({ path: 'screenshots/login-page-filled.png', fullPage: true });
  });

  // #36 - Forgot password page
  test('forgot-password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/forgot-password.png', fullPage: true });
  });

  // #39 #40 - Password visibility + validation
  test('signup-password', async ({ page }) => {
    await page.goto('/signup');
    await page.locator('#password').fill('short');
    await page.screenshot({ path: 'screenshots/signup-password-hint.png', fullPage: false });

    await page.locator('#password').fill('validpass');
    await page.locator('#confirmPassword').fill('mismatch');
    await page.screenshot({ path: 'screenshots/signup-password-mismatch.png', fullPage: false });
  });

  // #41 - ParentConsentStep overflow fix
  test('parent-consent-mobile', async ({ page }) => {
    await mockAgeCheck(page, true);
    await page.goto('/signup');
    await fillBasicInfo(page, '2012-03-20');
    await clickContinue(page);
    await page.waitForTimeout(1000);

    // Step 2 - How found us
    await page.getByLabel('Google').click();
    await clickContinue(page);
    await page.waitForTimeout(1000);

    // Step 3 - ParentConsentStep
    await page.screenshot({ path: 'screenshots/parent-consent-top.png', fullPage: false });

    // Scroll down to see more
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/parent-consent-middle.png', fullPage: false });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/parent-consent-bottom.png', fullPage: false });

    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    await page.screenshot({ path: 'screenshots/parent-consent-full.png', fullPage: true });
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  // #42 - Medical history scroll fix
  test('medical-history', async ({ page }) => {
    await mockAgeCheck(page, false);
    await page.goto('/signup');
    await fillBasicInfo(page, '1990-05-15');
    await clickContinue(page);
    await page.waitForTimeout(1000);

    // Step 2 - How found us
    await page.getByLabel('Google').click();
    await clickContinue(page);
    await page.waitForTimeout(1000);

    // Step 3 - Medical history
    await page.screenshot({ path: 'screenshots/medical-history.png', fullPage: false });
  });

  // #45 - Calendar date selection
  test('calendar-focus', async ({ page }) => {
    await page.goto('/signup');
    await page.locator('#birthDate').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/calendar-focus.png', fullPage: false });
  });

  // #48 - Terms page
  test('terms-page', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/terms-page.png', fullPage: false });
  });
});
