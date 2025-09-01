import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  hsn: z.string().min(1),
  unit: z.string().default('PCS'),
  price: z.number().positive(),
  taxRate: z.number().min(0).max(100).default(18),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(0),
  category: z.string().default('General'),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const product = await prisma.product.create({
      data: validatedData,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}