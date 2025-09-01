'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, calculateGST } from '@/lib/utils'
import { Plus, Trash2, Save, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  taxRate: number
  stock: number
}

interface Customer {
  id: string
  name: string
  state: string
}

interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  rate: number
  discount: number
  taxRate: number
  amount: number
}

export default function NewInvoicePage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customCustomerName, setCustomCustomerName] = useState('')
  const [useCustomName, setUseCustomName] = useState(false)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers')
      if (!response.ok) throw new Error('Failed to fetch customers')
      return response.json()
    },
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      return response.json()
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      })
      if (!response.ok) throw new Error('Failed to create invoice')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      router.push(`/invoices/${data.id}`)
    },
  })

  const addItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      taxRate: 18,
      amount: 0,
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'productId') {
      const product = products.find((p: Product) => p.id === value)
      if (product) {
        newItems[index].productName = product.name
        newItems[index].rate = product.price
        newItems[index].taxRate = product.taxRate
      }
    }
    
    // Recalculate amount
    const item = newItems[index]
    const lineTotal = (item.quantity * item.rate) - item.discount
    newItems[index].amount = lineTotal
    
    setItems(newItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0) - discount
    let totalCGST = 0
    let totalSGST = 0
    let totalIGST = 0

    // Assuming company is in Delhi for demo
    const companyState = 'Delhi'
    const customerState = selectedCustomer?.state || 'Delhi'

    items.forEach(item => {
      const gst = calculateGST(item.amount, item.taxRate, companyState, customerState)
      totalCGST += gst.cgst
      totalSGST += gst.sgst
      totalIGST += gst.igst
    })

    const total = subtotal + totalCGST + totalSGST + totalIGST

    return {
      subtotal,
      cgst: totalCGST,
      sgst: totalSGST,
      igst: totalIGST,
      total,
    }
  }

  const handleSubmit = () => {
    if ((!selectedCustomer && !useCustomName) || (useCustomName && !customCustomerName.trim()) || items.length === 0) {
      alert('Please select a customer or enter a custom customer name and add at least one item')
      return
    }

    const invoiceData = {
      customerId: selectedCustomer?.id,
      customerName: useCustomName ? customCustomerName.trim() : undefined,
      discount,
      notes,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
      })),
    }

    createInvoiceMutation.mutate(invoiceData)
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSubmit} disabled={createInvoiceMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Selection Method</Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!useCustomName}
                    onChange={() => {
                      setUseCustomName(false)
                      setCustomCustomerName('')
                    }}
                  />
                  <span>Existing Customer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={useCustomName}
                    onChange={() => {
                      setUseCustomName(true)
                      setSelectedCustomer(null)
                    }}
                  />
                  <span>Custom Customer Name</span>
                </label>
              </div>
            </div>

            {!useCustomName ? (
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer</Label>
                <select
                  id="customer"
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find((c: Customer) => c.id === e.target.value)
                    setSelectedCustomer(customer || null)
                  }}
                >
                  <option value="">Choose a customer...</option>
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="customCustomer">Customer Name</Label>
                <Input
                  id="customCustomer"
                  value={customCustomerName}
                  onChange={(e) => setCustomCustomerName(e.target.value)}
                  placeholder="Enter customer name..."
                />
              </div>
            )}
            
            {selectedCustomer && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium">{selectedCustomer.name}</h4>
                <p className="text-sm text-gray-600">{selectedCustomer.state}</p>
                {selectedCustomer.gstin && (
                  <p className="text-sm text-gray-600">GSTIN: {selectedCustomer.gstin}</p>
                )}
              </div>
            )}

            {useCustomName && customCustomerName && (
              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium">{customCustomerName}</h4>
                <p className="text-sm text-blue-600">Custom customer (one-time)</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Totals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.cgst > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span>{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span>{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              )}
              {totals.igst > 0 && (
                <div className="flex justify-between">
                  <span>IGST:</span>
                  <span>{formatCurrency(totals.igst)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <select
                      className="w-full px-2 py-1 border rounded"
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    >
                      <option value="">Select Product...</option>
                      {products.map((product: Product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.taxRate}%</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Invoice Discount</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or terms..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}