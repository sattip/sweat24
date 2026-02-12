import { test, expect } from '@playwright/test';

test.describe('Sweat24 Signup', () => {
  test('seed', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Verify signup page loaded
    await expect(page.locator('h1')).toContainText('Εγγραφή στο Sweat93');

    // Verify basic form fields are visible
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });
});
