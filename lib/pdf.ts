import PDFDocument from 'pdfkit'
import { formatCents, formatDate } from './format'
import type { Invoice, Customer, User } from './types'

export async function generateInvoicePdf(
  invoice: Invoice,
  customer: Customer,
  user: User
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 50)
    doc.fontSize(10).font('Helvetica').text(invoice.number, 50, 80)

    // Company info (right side)
    const rightX = 350
    if (user.company?.name) {
      doc.fontSize(12).font('Helvetica-Bold').text(user.company.name, rightX, 50, { width: 200, align: 'right' })
      doc.fontSize(9).font('Helvetica')
      let y = 68
      if (user.company.address) { doc.text(user.company.address, rightX, y, { width: 200, align: 'right' }); y += 14 }
      if (user.company.phone) { doc.text(user.company.phone, rightX, y, { width: 200, align: 'right' }); y += 14 }
      if (user.company.taxId) { doc.text(`Tax ID: ${user.company.taxId}`, rightX, y, { width: 200, align: 'right' }) }
    } else {
      doc.fontSize(10).font('Helvetica').text(user.email, rightX, 50, { width: 200, align: 'right' })
    }

    // Dates
    doc.fontSize(9).font('Helvetica')
    doc.text(`Issued: ${formatDate(invoice.issuedAt)}`, 50, 110)
    doc.text(`Due: ${formatDate(invoice.dueAt)}`, 50, 124)
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 50, 138)

    // Bill To
    doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, 170)
    doc.fontSize(10).font('Helvetica').text(customer.name, 50, 186)
    doc.text(customer.email, 50, 200)
    if (customer.address?.street) {
      const addr = [customer.address.street, customer.address.city, customer.address.state, customer.address.zip]
        .filter(Boolean)
        .join(', ')
      doc.text(addr, 50, 214)
    }

    // Table header
    const tableTop = 260
    doc.fontSize(9).font('Helvetica-Bold')
    doc.text('Description', 50, tableTop)
    doc.text('Qty', 300, tableTop, { width: 50, align: 'right' })
    doc.text('Unit Price', 360, tableTop, { width: 80, align: 'right' })
    doc.text('Total', 450, tableTop, { width: 80, align: 'right' })

    doc.moveTo(50, tableTop + 16).lineTo(530, tableTop + 16).stroke('#cccccc')

    // Table rows
    doc.font('Helvetica').fontSize(9)
    let y = tableTop + 24
    for (const item of invoice.items) {
      doc.text(item.description, 50, y, { width: 240 })
      doc.text(item.quantity.toString(), 300, y, { width: 50, align: 'right' })
      doc.text(formatCents(item.unitPriceCents), 360, y, { width: 80, align: 'right' })
      doc.text(formatCents(item.totalCents), 450, y, { width: 80, align: 'right' })
      y += 20
    }

    // Totals
    doc.moveTo(350, y + 4).lineTo(530, y + 4).stroke('#cccccc')
    y += 14

    doc.text('Subtotal:', 360, y, { width: 80, align: 'right' })
    doc.text(formatCents(invoice.subtotalCents), 450, y, { width: 80, align: 'right' })
    y += 16

    if (invoice.taxCents > 0) {
      doc.text(`Tax (${invoice.taxRate}%):`, 360, y, { width: 80, align: 'right' })
      doc.text(formatCents(invoice.taxCents), 450, y, { width: 80, align: 'right' })
      y += 16
    }

    doc.font('Helvetica-Bold').fontSize(11)
    doc.text('Total:', 360, y, { width: 80, align: 'right' })
    doc.text(formatCents(invoice.totalCents), 450, y, { width: 80, align: 'right' })

    // Notes
    if (invoice.notes) {
      y += 40
      doc.font('Helvetica-Bold').fontSize(9).text('Notes:', 50, y)
      doc.font('Helvetica').fontSize(9).text(invoice.notes, 50, y + 14, { width: 400 })
    }

    doc.end()
  })
}
