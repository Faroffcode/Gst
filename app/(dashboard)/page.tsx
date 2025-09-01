'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Package } from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with actual API calls
const dashboardData = {
  todaySales: 25000,
  thisMonthSales: 150000,
  outstanding: 75000,
  lowStockItems: 8,
  recentInvoices: [
    { id: 'INV/23-24/000001', customer: 'ABC Enterprises', amount: 12500, status: 'PAID' },
    { id: 'INV/23-24/000002', customer: 'XYZ Corp', amount: 8750, status: 'PENDING' },
    { id: 'INV/23-24/000003', customer: 'Walk-in Customer', amount: 15200, status: 'SENT' },
  ],
  lowStockProducts: [
    { name: 'Product A', stock: 5, minStock: 10 },
    { name: 'Product B', stock: 2, minStock: 15 },
    { name: 'Product C', stock: 8, minStock: 20 },
  ]
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.todaySales)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.thisMonthSales)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.outstanding)}</div>
            <p className="text-xs text-muted-foreground">
              5 pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{dashboardData.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items below minimum stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                  <p className={`text-xs ${
                    invoice.status === 'PAID' ? 'text-green-600' : 
                    invoice.status === 'PENDING' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {invoice.status}
                  </p>
                </div>
              </div>
            ))}
            <Link href="/invoices" className="block">
              <Button variant="outline" className="w-full">
                View All Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.lowStockProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Min: {product.minStock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{product.stock}</p>
                  <p className="text-xs text-muted-foreground">in stock</p>
                </div>
              </div>
            ))}
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">
                Manage Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}