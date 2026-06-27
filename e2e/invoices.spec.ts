import { test, expect } from '@playwright/test'

test.describe('Invoices page (unauthenticated)', () => {
  test('redirects unauthenticated users away from invoices list', async ({ page }) => {
    await page.goto('/invoices')
    await page.waitForTimeout(1000)
    const url = page.url()
    expect(url).not.toContain('/invoices')
  })
})

test.describe('Invoice API validation', () => {
  test('POST /api/invoices returns 401 without session', async ({ request }) => {
    const response = await request.post('/api/invoices', {
      data: {
        customerId: '000000000000000000000000',
        items: [{ description: 'Test', quantity: 1, unitPrice: 1000 }],
        taxRate: 21,
      },
    })
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('GET /api/invoices returns 401 without session', async ({ request }) => {
    const response = await request.get('/api/invoices')
    expect(response.status()).toBe(401)
  })

  test('GET /api/invoices/nonexistent/pdf returns 401 without session', async ({ request }) => {
    const response = await request.get('/api/invoices/000000000000000000000000/pdf')
    expect(response.status()).toBe(401)
  })
})

test.describe('Landing page', () => {
  test('landing page loads with CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Invoicing/)
    // Should have a sign-in or get started link
    const ctaLink = page.getByRole('link', { name: /get started|sign in|login/i })
    await expect(ctaLink.first()).toBeVisible()
  })
})
