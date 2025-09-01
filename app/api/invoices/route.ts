import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calculateGST, generateInvoiceNumber } from '@/lib/utils'

const invoiceItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
  discount: z.number().min(0).default(0),
})

const invoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
}).refine(
  (data) => data.customerId || data.customerName,
  {
    message: "Either customerId or customerName must be provided",
    path: ["customerId"],
  }
)

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = invoiceSchema.parse(body)

    // Get current year for invoice numbering
    const currentYear = new Date().getFullYear()
    
    // Get or create invoice counter
    let counter = await prisma.invoiceCounter.findUnique({
      where: {
        year_prefix: {
          year: currentYear,
          prefix: 'INV',
        },
      },
    })

    if (!counter) {
      counter = await prisma.invoiceCounter.create({
        data: {
          year: currentYear,
          prefix: 'INV',
          lastNumber: 0,
        },
      })
    }

    // Increment counter
    const newCounter = await prisma.invoiceCounter.update({
      where: { id: counter.id },
      data: { lastNumber: counter.lastNumber + 1 },
    })

    const invoiceNumber = generateInvoiceNumber(currentYear, newCounter.lastNumber)

    // Handle customer information
    let customer = null
    let customerState = 'Delhi' // Default state for custom customers
    
    if (validatedData.customerId) {
      // Get existing customer
      customer = await prisma.customer.findUnique({
        where: { id: validatedData.customerId },
      })

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      
      customerState = customer.state
    } else if (validatedData.customerName) {
      // Use custom customer name with default state
      customerState = 'Delhi' // You might want to add state selection for custom customers
    }

    // Get company info (assuming single company setup)
    const company = await prisma.company.findFirst()
    const companyState = company?.state || 'Delhi'

    // Calculate totals
    let subtotal = 0
    let totalCGST = 0
    let totalSGST = 0
    let totalIGST = 0

    const invoiceItems = []

    for (const item of validatedData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        )
      }

      const amount = item.quantity * item.rate - item.discount
      const gst = calculateGST(amount, product.taxRate, companyState, customerState)

      subtotal += amount
      totalCGST += gst.cgst
      totalSGST += gst.sgst
      totalIGST += gst.igst

      invoiceItems.push({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        taxRate: product.taxRate,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        amount: amount + gst.total,
      })
    }

    // Apply invoice-level discount proportionally
    if (validatedData.discount > 0) {
      subtotal -= validatedData.discount
    }

    const total = subtotal + totalCGST + totalSGST + totalIGST

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: validatedData.customerId,
        customerName: validatedData.customerName,
        invoiceDate: validatedData.invoiceDate ? new Date(validatedData.invoiceDate) : new Date(),
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        subtotal,
        discount: validatedData.discount,
        cgst: totalCGST,
        sgst: totalSGST,
        igst: totalIGST,
        total,
        notes: validatedData.notes,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update stock and create stock movements
    for (const item of validatedData.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          reference: invoiceNumber,
          notes: `Sale via invoice ${invoiceNumber}`,
        },
      })
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Invoice creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}