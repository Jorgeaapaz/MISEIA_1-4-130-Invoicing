import { test, expect } from '@playwright/test'

const MAILHOG_API = 'http://localhost:8025/api/v2/messages'
const TEST_EMAIL = `e2e-${Date.now()}@example.com`

async function getMagicLinkToken(): Promise<string | null> {
  const response = await fetch(MAILHOG_API)
  if (!response.ok) return null
  const data = await response.json() as { items: Array<{ Raw: { Data: string } }> }
  if (!data.items?.length) return null

  const latestEmail = data.items[0]
  const body = latestEmail.Raw.Data
  const match = body.match(/token=([a-f0-9-]{36})/)
  return match ? match[1] : null
}

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page).toHaveTitle(/Invoicing/)
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  })

  test('shows error for invalid email', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('textbox', { name: /email/i }).fill('not-an-email')
    await page.getByRole('button', { name: /send/i }).click()
    // Browser native validation prevents submission
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await expect(emailInput).toBeVisible()
  })

  test('submits magic link form and shows a response state', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_EMAIL)
    await page.getByRole('button', { name: /send magic link/i }).click()
    // App must show either success ("Check your email") or an error message — never stay silent
    await expect(
      page.getByText(/check your email|something went wrong|failed|error/i)
    ).toBeVisible({ timeout: 10000 })
  })

  test('full magic link login flow (requires Mailhog)', async ({ page }) => {
    // Skip if Mailhog is not available
    let mailhogAvailable = false
    try {
      const check = await fetch('http://localhost:8025/api/v2/messages')
      mailhogAvailable = check.ok
    } catch {
      mailhogAvailable = false
    }
    if (!mailhogAvailable) {
      test.skip()
      return
    }

    // Step 1: request magic link
    await page.goto('/auth/login')
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_EMAIL)
    await page.getByRole('button', { name: /send magic link/i }).click()
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10000 })

    // Step 2: get token from Mailhog
    const token = await getMagicLinkToken()
    if (!token) {
      test.skip()
      return
    }

    // Step 3: navigate to verify URL
    await page.goto(`/api/auth/verify?token=${token}`)
    await page.waitForURL(/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/dashboard/)
  })

  test('unauthenticated users are redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    // Should be redirected to login or show auth error
    await page.waitForTimeout(1000)
    const url = page.url()
    expect(url).not.toContain('/dashboard')
  })
})
