'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { 
  Package, 
  Plus, 
  Minus, 
  RotateCcw, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  History,
  Edit,
  Trash2
} from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  hsn: string
  unit: string
  price: number
  taxRate: number
  stock: number
  minStock: number
  category: string
  description?: string
}

interface StockMovement {
  id: string
  type: string
  quantity: number
  reference?: string
  notes?: string
  createdAt: string
  product: {
    name: string
    sku: string
  }
}

export default function InventoryPage() {
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stockMovementType, setStockMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN')
  const [quantity, setQuantity] = useState(0)
  const [notes, setNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const queryClient = useQueryClient()

  const categories = [
    'All',
    'Fertilizers',
    'Micronutrients', 
    'Bio-fertilizers',
    'Pesticides',
    'General'
  ]

  const categoryIcons = {
    'All': Package,
    'Fertilizers': '🌱',
    'Micronutrients': '⚗️',
    'Bio-fertilizers': '🌿',
    'Pesticides': '🛡️',
    'General': '📦'
  }

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      return response.json()
    },
  })

  const { data: stockMovements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const response = await fetch('/api/stock-movements')
      if (!response.ok) throw new Error('Failed to fetch stock movements')
      return response.json()
    },
  })

  const stockAdjustmentMutation = useMutation({
    mutationFn: async (data: {
      productId: string
      type: string
      quantity: number
      notes: string
    }) => {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to adjust stock')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      setIsStockDialogOpen(false)
      setSelectedProduct(null)
      setQuantity(0)
      setNotes('')
    },
  })

  const handleStockAdjustment = () => {
    if (!selectedProduct || quantity <= 0) return

    const adjustedQuantity = stockMovementType === 'OUT' ? -quantity : quantity

    stockAdjustmentMutation.mutate({
      productId: selectedProduct.id,
      type: stockMovementType,
      quantity: adjustedQuantity,
      notes: notes || `${stockMovementType} - ${quantity} units`,
    })
  }

  const openStockDialog = (product: Product, type: 'IN' | 'OUT' | 'ADJUSTMENT') => {
    setSelectedProduct(product)
    setStockMovementType(type)
    setIsStockDialogOpen(true)
  }

  const getLowStockProducts = () => {
    const filtered = selectedCategory === 'All' 
      ? products 
      : products.filter((product: Product) => product.category === selectedCategory)
    return filtered.filter((product: Product) => product.stock <= product.minStock)
  }

  const getOutOfStockProducts = () => {
    const filtered = selectedCategory === 'All' 
      ? products 
      : products.filter((product: Product) => product.category === selectedCategory)
    return filtered.filter((product: Product) => product.stock === 0)
  }

  const getTotalInventoryValue = () => {
    const filtered = selectedCategory === 'All' 
      ? products 
      : products.filter((product: Product) => product.category === selectedCategory)
    return filtered.reduce((total: number, product: Product) => {
      return total + (product.stock * product.price)
    }, 0)
  }

  const getFilteredProducts = () => {
    return selectedCategory === 'All' 
      ? products 
      : products.filter((product: Product) => product.category === selectedCategory)
  }

  const getCategoryStats = (category: string) => {
    const categoryProducts = category === 'All' 
      ? products 
      : products.filter((product: Product) => product.category === category)
    
    return {
      total: categoryProducts.length,
      lowStock: categoryProducts.filter(p => p.stock <= p.minStock).length,
      outOfStock: categoryProducts.filter(p => p.stock === 0).length,
      value: categoryProducts.reduce((sum, p) => sum + (p.stock * p.price), 0)
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'ADJUSTMENT':
        return <RotateCcw className="h-4 w-4 text-blue-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  if (productsLoading) {
    return <div>Loading inventory...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <div className="flex space-x-2">
          <select
            className="px-3 py-2 border rounded-md bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const stats = getCategoryStats(category)
          const isActive = selectedCategory === category
          return (
            <Button
              key={category}
              variant={isActive ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="flex items-center space-x-2"
            >
              <span className="text-lg">
                {typeof categoryIcons[category as keyof typeof categoryIcons] === 'string' 
                  ? categoryIcons[category as keyof typeof categoryIcons]
                  : '📦'
                }
              </span>
              <span>{category}</span>
              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                isActive ? 'bg-white text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {stats.total}
              </span>
            </Button>
          )
        })}
      </div>

      {/* Inventory Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedCategory === 'All' ? 'Total Products' : `${selectedCategory} Products`}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getFilteredProducts().length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedCategory === 'All' ? 'All categories' : `${selectedCategory} SKUs`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedCategory === 'All' ? 'Total Inventory Value' : `${selectedCategory} Value`}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalInventoryValue())}</div>
            <p className="text-xs text-muted-foreground">
              {selectedCategory === 'All' ? 'All categories' : `${selectedCategory} stock value`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{getLowStockProducts().length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedCategory === 'All' ? 'All categories' : `${selectedCategory} items`} below minimum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getOutOfStockProducts().length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedCategory === 'All' ? 'All categories' : `${selectedCategory} items`} zero inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="current-stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current-stock">Current Stock</TabsTrigger>
          <TabsTrigger value="stock-movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        {/* Current Stock Tab */}
        <TabsContent value="current-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                {selectedCategory === 'All' ? 'Current Inventory' : `${selectedCategory} Inventory`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Stock Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredProducts().map((product: Product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.sku}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock <= product.minStock ? 'text-amber-600' : 
                          'text-green-600'
                        }`}>
                          {formatNumber(product.stock)} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell>{formatNumber(product.minStock)} {product.unit}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{formatCurrency(product.stock * product.price)}</TableCell>
                      <TableCell>
                        {product.stock === 0 ? (
                          <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                        ) : product.stock <= product.minStock ? (
                          <span className="text-amber-600 text-sm font-medium">Low Stock</span>
                        ) : (
                          <span className="text-green-600 text-sm font-medium">In Stock</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStockDialog(product, 'IN')}
                            title="Add Stock"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStockDialog(product, 'OUT')}
                            title="Remove Stock"
                            disabled={product.stock === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStockDialog(product, 'ADJUSTMENT')}
                            title="Adjust Stock"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="stock-movements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Stock Movement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div>Loading movements...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement: StockMovement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.product.name}</div>
                            <div className="text-sm text-muted-foreground">{movement.product.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMovementIcon(movement.type)}
                            <span className="capitalize">{movement.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.quantity > 0 ? '+' : ''}{formatNumber(movement.quantity)}
                          </span>
                        </TableCell>
                        <TableCell>{movement.reference || '-'}</TableCell>
                        <TableCell>{movement.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Alerts Tab */}
        <TabsContent value="alerts">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-amber-600">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getLowStockProducts().length > 0 ? (
                  <div className="space-y-3">
                    {getLowStockProducts().map((product: Product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-amber-600">{product.stock} {product.unit}</p>
                          <p className="text-xs text-muted-foreground">Min: {product.minStock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No low stock alerts</p>
                )}
              </CardContent>
            </Card>

            {/* Out of Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getOutOfStockProducts().length > 0 ? (
                  <div className="space-y-3">
                    {getOutOfStockProducts().map((product: Product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">0 {product.unit}</p>
                          <Button
                            size="sm"
                            onClick={() => openStockDialog(product, 'IN')}
                          >
                            Restock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No out of stock items</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockMovementType === 'IN' ? 'Add Stock' : 
               stockMovementType === 'OUT' ? 'Remove Stock' : 'Adjust Stock'}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedProduct.name}</h4>
                <p className="text-sm text-muted-foreground">
                  SKU: {selectedProduct.sku} | Current Stock: {selectedProduct.stock} {selectedProduct.unit}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="movement-type">Movement Type</Label>
                <select
                  id="movement-type"
                  className="w-full px-3 py-2 border rounded-md"
                  value={stockMovementType}
                  onChange={(e) => setStockMovementType(e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT')}
                >
                  <option value="IN">Stock In (Add)</option>
                  <option value="OUT">Stock Out (Remove)</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for stock movement..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsStockDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStockAdjustment}
                  disabled={quantity <= 0 || stockAdjustmentMutation.isPending}
                >
                  {stockMovementType === 'IN' ? 'Add Stock' : 
                   stockMovementType === 'OUT' ? 'Remove Stock' : 'Adjust Stock'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}