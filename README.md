# GST Invoice & Inventory Management System

A comprehensive full-stack web application for personal GST invoicing and inventory management built with Next.js, TypeScript, and Prisma.

## Features

### Core Functionality
- **Dashboard**: Overview of sales, outstanding amounts, and low stock alerts
- **Inventory Management**: Add, edit, delete products with stock tracking
- **Customer Management**: Maintain customer database with GST details
- **Invoice Generation**: Create GST-compliant invoices with automatic calculations
- **Reports**: GST summaries and sales analytics
- **Settings**: Company profile, invoice settings, and digital signatures

### GST Compliance
- Automatic GST calculation (CGST+SGST for intra-state, IGST for inter-state)
- HSN code support
- GSTIN validation and state code derivation
- Invoice numbering format: INV/YY-YY/XXXXXX (resets yearly)
- Amount in words conversion (Indian numbering system)

### Business Logic
- Stock management with automatic deduction on sales
- Low stock alerts and inventory tracking
- Customer state-based GST calculations
- Invoice-level discount distribution
- Stock movement ledger
- Comprehensive audit trail

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Query** - Server state management
- **Lucide Icons** - Beautiful icons

### Backend
- **Next.js API Routes** - Backend API endpoints
- **Prisma ORM** - Database toolkit and ORM
- **SQLite** - Local database (can be switched to PostgreSQL)
- **Zod** - Schema validation

### Database Schema
- Companies, Customers, Products
- Invoices with line items
- Stock movements and inventory tracking
- Invoice counters for auto-numbering

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd "d:\web project\Gst"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the database with sample data**
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to access the application.

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Dashboard layout and pages
│   │   ├── page.tsx         # Dashboard home
│   │   ├── products/        # Product management
│   │   ├── customers/       # Customer management
│   │   ├── invoices/        # Invoice management
│   │   ├── reports/         # Reports and analytics
│   │   └── settings/        # Application settings
│   ├── api/                 # API routes
│   │   ├── products/        # Product CRUD operations
│   │   ├── customers/       # Customer CRUD operations
│   │   └── invoices/        # Invoice operations
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── layout/              # Layout components
│   └── providers/           # Context providers
├── lib/
│   ├── prisma.ts           # Prisma client setup
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data script
└── types/
    └── global.d.ts         # Global type definitions
```

## Key Features Usage

### Creating an Invoice
1. Navigate to **Invoices** → **Create Invoice**
2. Select a customer from the dropdown
3. Add products with quantities and rates
4. Apply discounts if needed
5. Review GST calculations (automatic based on customer state)
6. Save the invoice (stock will be automatically updated)

### Managing Inventory
1. Go to **Products** page
2. Add new products with SKU, HSN, price, and tax rates
3. Set minimum stock levels for alerts
4. Monitor stock levels and receive low-stock warnings

### Customer Management
1. Navigate to **Customers** page
2. Add customer details including GSTIN
3. State codes are auto-derived from GSTIN
4. Maintain customer contact information

### Reports and Analytics
1. Access **Reports** for GST summaries
2. View sales trends and analytics
3. Monitor top-selling products
4. Track invoice statuses

## Configuration

### Company Settings
Configure your company details in **Settings** → **Company**:
- Company name and GSTIN
- Address and contact information
- Bank details for invoices
- Digital signature upload

### Invoice Settings
Customize invoice behavior in **Settings** → **Invoice**:
- Invoice number prefix
- Starting invoice number
- Default terms and conditions

## Database Operations

### Reset Database
```bash
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

### View Database
```bash
npx prisma studio
```

### Generate Prisma Client
```bash
npx prisma generate
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice

## Business Rules

1. **GST Calculation**:
   - Same state: CGST + SGST (split equally)
   - Different state: IGST (full amount)

2. **Invoice Numbering**:
   - Format: INV/YY-YY/XXXXXX
   - Resets annually
   - Sequential numbering

3. **Stock Management**:
   - Automatic stock deduction on invoice creation
   - Low stock alerts based on minimum levels
   - Stock movement tracking

4. **Amount Conversion**:
   - Indian numbering system (lakhs, crores)
   - Automatic amount to words conversion

## Contributing

This is a personal project template. Feel free to customize according to your business requirements.

## License

This project is for personal use and can be modified as needed.

## Support

For any issues or questions, please refer to the code comments and documentation within the files.