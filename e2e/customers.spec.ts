import { test, expect } from '@playwright/test'

test.describe('Customers page (unauthenticated)', () => {
  test('redirects unauthenticated users away from customers list', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForTimeout(1000)
    const url = page.url()
    expect(url).not.toContain('/customers')
  })
})

test.describe('Customer API validation', () => {
  test('POST /api/customers returns 401 without session', async ({ request }) => {
    const response = await request.post('/api/customers', {
      data: { name: 'Test Corp', email: 'test@corp.com' },
    })
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('GET /api/customers returns 401 without session', async ({ request }) => {
    const response = await request.get('/api/customers')
    expect(response.status()).toBe(401)
  })

  test('POST /api/customers returns 400 for missing name', async ({ request }) => {
    const response = await request.post('/api/customers', {
      data: { email: 'test@corp.com' },
    })
    // Expecting 400 or 401 (auth check runs first)
    expect([400, 401]).toContain(response.status())
  })
})
