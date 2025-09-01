import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const stockMovementSchema = z.object({
  productId: z.string(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().int(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  try {
    const stockMovements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 movements
    })
    
    return NextResponse.json(stockMovements)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = stockMovementSchema.parse(body)

    // Get current product to validate stock levels
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate new stock level
    let newStock = product.stock
    if (validatedData.type === 'IN') {
      newStock += Math.abs(validatedData.quantity)
    } else if (validatedData.type === 'OUT') {
      newStock -= Math.abs(validatedData.quantity)
    } else if (validatedData.type === 'ADJUSTMENT') {
      // For adjustments, quantity can be positive or negative
      newStock += validatedData.quantity
    }

    // Prevent negative stock (optional - you can remove this check if negative stock is allowed)
    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock for this operation' },
        { status: 400 }
      )
    }

    // Create stock movement record and update product stock in a transaction
    const result = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: validatedData.productId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          reference: validatedData.reference,
          notes: validatedData.notes,
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      }),
      prisma.product.update({
        where: { id: validatedData.productId },
        data: { stock: newStock },
      }),
    ])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Stock movement error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 }
    )
  }
}