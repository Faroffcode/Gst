'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Building, FileText, PenTool } from 'lucide-react'

export default function SettingsPage() {
  const [companyData, setCompanyData] = useState({
    name: 'Your Company Name',
    gstin: '07AAAAA0000A1Z5',
    address: '123 Business Street',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    phone: '+91 9876543210',
    email: 'contact@yourcompany.com',
    bankName: 'State Bank of India',
    bankAccount: '1234567890',
    bankIFSC: 'SBIN0000123',
  })

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: 'INV',
    startNumber: 1,
    terms: 'Payment due within 30 days',
  })

  const handleCompanyUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // Add API call to update company settings
    alert('Company settings updated successfully!')
  }

  const handleInvoiceSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // Add API call to update invoice settings
    alert('Invoice settings updated successfully!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company" className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="signature" className="flex items-center">
            <PenTool className="mr-2 h-4 w-4" />
            Signature
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanyUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={companyData.gstin}
                      onChange={(e) => setCompanyData({...companyData, gstin: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={companyData.city}
                      onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={companyData.state}
                      onChange={(e) => setCompanyData({...companyData, state: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={companyData.pincode}
                      onChange={(e) => setCompanyData({...companyData, pincode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6">Bank Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={companyData.bankName}
                      onChange={(e) => setCompanyData({...companyData, bankName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Account Number</Label>
                    <Input
                      id="bankAccount"
                      value={companyData.bankAccount}
                      onChange={(e) => setCompanyData({...companyData, bankAccount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankIFSC">IFSC Code</Label>
                    <Input
                      id="bankIFSC"
                      value={companyData.bankIFSC}
                      onChange={(e) => setCompanyData({...companyData, bankIFSC: e.target.value})}
                    />
                  </div>
                </div>

                <Button type="submit">Save Company Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvoiceSettingsUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Invoice Prefix</Label>
                    <Input
                      id="prefix"
                      value={invoiceSettings.prefix}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, prefix: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startNumber">Starting Number</Label>
                    <Input
                      id="startNumber"
                      type="number"
                      value={invoiceSettings.startNumber}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, startNumber: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Default Terms & Conditions</Label>
                  <textarea
                    id="terms"
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                    value={invoiceSettings.terms}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, terms: e.target.value})}
                  />
                </div>

                <Button type="submit">Save Invoice Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signature">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="mr-2 h-5 w-5" />
                Digital Signature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signature">Upload Signature</Label>
                  <Input
                    id="signature"
                    type="file"
                    accept="image/*"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload your signature image (PNG, JPG, GIF). Recommended size: 300x100 pixels.
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Current signature will appear here</p>
                </div>

                <Button>Save Signature</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}