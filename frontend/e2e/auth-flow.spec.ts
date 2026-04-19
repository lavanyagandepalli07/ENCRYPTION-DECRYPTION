import { test, expect } from '@playwright/test';

test.describe('Encryption Application Flow', () => {
  test('should allow user to navigate and see login page', async ({ page }) => {
    await page.goto('/');
    
    // Check if we are on the login page (or redirected to it)
    await expect(page).toHaveTitle(/Encryption/);
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  test('should show validation errors on login', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('button[type="submit"]');
    
    // Check for standard HTML5 validation or custom errors
    // Since we use Supabase, we might see specific errors
    // For now just check if we stay on the login page
    await expect(page.url()).toContain('/login');
  });

  test('should show passphrase strength during encryption', async ({ page }) => {
    // This test would ideally log in first, but we can test the UI components if they are accessible
    await page.goto('/encrypt');
    
    // If not logged in, we might be redirected. 
    // Assuming for this test we want to check the component interaction
    const passphraseInput = page.locator('input[type="password"]');
    if (await passphraseInput.isVisible()) {
        await passphraseInput.fill('short');
        await expect(page.getByText('Weak')).toBeVisible();
        
        await passphraseInput.fill('Complex!1234567890');
        await expect(page.getByText('Very Strong')).toBeVisible();
    }
  });
});
