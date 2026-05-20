import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || 'localhost',
  port: Number(process.env.MAIL_PORT) || 1027,
  secure: false,
})

export async function sendMagicLinkEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const magicLinkUrl = `${baseUrl}/api/auth/verify?token=${token}`

  await transporter.sendMail({
    from: '"Invoicing App" <noreply@invoicing.app>',
    to: email,
    subject: 'Your magic link to sign in',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #ededed; margin-bottom: 16px;">Sign in to Invoicing</h2>
        <p style="color: #a0a0a0; margin-bottom: 24px;">
          Click the button below to sign in. This link expires in 15 minutes.
        </p>
        <a href="${magicLinkUrl}"
           style="display: inline-block; background: #3b82f6; color: #fff; padding: 12px 24px;
                  border-radius: 6px; text-decoration: none; font-weight: 600;">
          Sign In
        </a>
        <p style="color: #666; margin-top: 24px; font-size: 13px;">
          If you didn't request this link, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendInvoiceEmail(
  to: string,
  subject: string,
  html: string,
  pdfBuffer?: Buffer
): Promise<void> {
  const attachments = pdfBuffer
    ? [{ filename: 'invoice.pdf', content: pdfBuffer, contentType: 'application/pdf' }]
    : []

  await transporter.sendMail({
    from: '"Invoicing App" <noreply@invoicing.app>',
    to,
    subject,
    html,
    attachments,
  })
}
