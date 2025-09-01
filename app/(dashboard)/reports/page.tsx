'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp, FileText, Package } from 'lucide-react'

export default function ReportsPage() {
  // Mock data - replace with actual API calls
  const gstSummary = {
    cgst: 25000,
    sgst: 25000,
    igst: 15000,
    total: 65000
  }

  const salesData = [
    { month: 'Jan', sales: 120000 },
    { month: 'Feb', sales: 150000 },
    { month: 'Mar', sales: 180000 },
    { month: 'Apr', sales: 140000 },
    { month: 'May', sales: 200000 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>

      {/* GST Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            GST Summary (Current Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600">CGST Collected</h3>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(gstSummary.cgst)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-green-600">SGST Collected</h3>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(gstSummary.sgst)}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600">IGST Collected</h3>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(gstSummary.igst)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Total GST</h3>
              <p className="text-2xl font-bold text-gray-700">{formatCurrency(gstSummary.total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Sales Trend (Last 5 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="font-medium">{data.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(data.sales / 200000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold">{formatCurrency(data.sales)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Invoices This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Top Selling Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Product ABC</div>
            <p className="text-sm text-muted-foreground">150 units sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Invoice Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(8250)}</div>
            <p className="text-sm text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}