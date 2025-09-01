import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getStateCodeFromGSTIN } from '@/lib/utils'

const customerSchema = z.object({
  name: z.string().min(1),
  gstin: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = customerSchema.parse(body)

    // Auto-derive state code from GSTIN if present
    const stateCode = validatedData.gstin 
      ? getStateCodeFromGSTIN(validatedData.gstin) 
      : validatedData.state

    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        stateCode,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}