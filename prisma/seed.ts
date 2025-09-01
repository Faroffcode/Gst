import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create company
  const company = await prisma.company.create({
    data: {
      name: 'Your Business Name',
      gstin: '07AAAAA0000A1Z5',
      address: '123 Business Street, Business Complex',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 9876543210',
      email: 'contact@yourbusiness.com',
      bankName: 'State Bank of India',
      bankAccount: '1234567890123456',
      bankIFSC: 'SBIN0000123',
    },
  })

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'ABC Enterprises',
      gstin: '07BBBBB1111B1Z5',
      address: '456 Customer Street',
      city: 'New Delhi',
      state: 'Delhi',
      stateCode: 'Delhi',
      pincode: '110002',
      phone: '+91 9876543211',
      email: 'contact@abcenterprises.com',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'XYZ Corporation',
      gstin: '27CCCCC2222C1Z5',
      address: '789 Business Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: 'Maharashtra',
      pincode: '400001',
      phone: '+91 9876543212',
      email: 'orders@xyzcorp.com',
    },
  })

  const customer3 = await prisma.customer.create({
    data: {
      name: 'PQR Limited',
      address: '321 Industrial Area',
      city: 'Bangalore',
      state: 'Karnataka',
      stateCode: 'Karnataka',
      pincode: '560001',
      phone: '+91 9876543213',
      email: 'procurement@pqrlimited.com',
    },
  })

  // Create products with categories
  const product1 = await prisma.product.create({
    data: {
      sku: 'FERT001',
      name: 'NPK Complex Fertilizer 10:26:26',
      hsn: '3105',
      unit: 'KG',
      price: 850.00,
      taxRate: 5.0,
      stock: 500,
      minStock: 50,
      category: 'Fertilizers',
      description: 'High-quality NPK fertilizer for balanced plant nutrition',
    },
  })

  const product2 = await prisma.product.create({
    data: {
      sku: 'MICRO001',
      name: 'Zinc Sulphate Micronutrient',
      hsn: '2833',
      unit: 'KG',
      price: 120.00,
      taxRate: 18.0,
      stock: 25,
      minStock: 15,
      category: 'Micronutrients',
      description: 'Essential zinc micronutrient for plant growth',
    },
  })

  const product3 = await prisma.product.create({
    data: {
      sku: 'BIO001',
      name: 'Organic Bio-fertilizer Concentrate',
      hsn: '3101',
      unit: 'LTR',
      price: 450.00,
      taxRate: 5.0,
      stock: 8,
      minStock: 20,
      category: 'Bio-fertilizers',
      description: 'Natural bio-fertilizer for organic farming',
    },
  })

  const product4 = await prisma.product.create({
    data: {
      sku: 'PEST001',
      name: 'Insecticide Spray Solution',
      hsn: '3808',
      unit: 'LTR',
      price: 2500.00,
      taxRate: 18.0,
      stock: 15,
      minStock: 5,
      category: 'Pesticides',
      description: 'Effective insecticide for pest control',
    },
  })

  const product5 = await prisma.product.create({
    data: {
      sku: 'FERT002',
      name: 'Urea Fertilizer 46% Nitrogen',
      hsn: '3102',
      unit: 'KG',
      price: 650.00,
      taxRate: 5.0,
      stock: 300,
      minStock: 100,
      category: 'Fertilizers',
      description: 'High nitrogen content urea fertilizer',
    },
  })

  const product6 = await prisma.product.create({
    data: {
      sku: 'MICRO002',
      name: 'Iron Chelate Micronutrient',
      hsn: '2833',
      unit: 'KG',
      price: 180.00,
      taxRate: 18.0,
      stock: 12,
      minStock: 10,
      category: 'Micronutrients',
      description: 'Iron deficiency correction micronutrient',
    },
  })

  // Create invoice counter for current year
  const currentYear = new Date().getFullYear()
  await prisma.invoiceCounter.create({
    data: {
      year: currentYear,
      prefix: 'INV',
      lastNumber: 0,
    },
  })

  // Create some stock movements for demo
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product1.id,
        type: 'IN',
        quantity: 500,
        reference: 'PO-001',
        notes: 'Initial fertilizer stock purchase',
      },
      {
        productId: product2.id,
        type: 'IN',
        quantity: 30,
        reference: 'PO-002',
        notes: 'Micronutrient stock replenishment',
      },
      {
        productId: product3.id,
        type: 'IN',
        quantity: 15,
        reference: 'PO-003',
        notes: 'Bio-fertilizer initial stock',
      },
      {
        productId: product5.id,
        type: 'IN',
        quantity: 400,
        reference: 'PO-004',
        notes: 'Urea fertilizer bulk purchase',
      },
      {
        productId: product1.id,
        type: 'OUT',
        quantity: -50,
        reference: 'SALE-001',
        notes: 'Customer order dispatch',
      },
      {
        productId: product3.id,
        type: 'OUT',
        quantity: -7,
        reference: 'DAMAGE-001',
        notes: 'Damaged bio-fertilizer removed',
      },
      {
        productId: product5.id,
        type: 'OUT',
        quantity: -100,
        reference: 'SALE-002',
        notes: 'Urea fertilizer bulk sale',
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log('Company:', company.name)
  console.log('Customers created:', 3)
  console.log('Products created:', 6)
  console.log('Stock movements created:', 7)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })