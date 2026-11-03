'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Upload, Building2, MapPin, Phone, Mail, FileText, User, Copy } from 'lucide-react'
import { useGetCompanySettingsQuery, useUpdateCompanySettingsMutation } from '@/store/services/settingSlice'
import { toast } from 'react-hot-toast'
import { BASE_URL } from '@/store/constants'

export default function SettingsPage() {
  const { data: settingsRes, isLoading, refetch } = useGetCompanySettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdateCompanySettingsMutation()

  const [formData, setFormData] = useState({
    companyName: '',
    signatureName: '',
    signatureRole: '',
    address: '',
    mobileNo: '',
    email: '',
    gstNo: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (settingsRes?.data) {
      const data = settingsRes.data
      setFormData({
        companyName: data.companyName || '',
        signatureName: data.signatureName || '',
        signatureRole: data.signatureRole || '',
        address: data.address || '',
        mobileNo: data.mobileNo || '',
        email: data.email || '',
        gstNo: data.gstNo || '',
      })
      if (data.logo) {
        setLogoPreview(data.logo.startsWith('http') ? data.logo : `${BASE_URL}${data.logo}`)
      }
    }
  }, [settingsRes])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value)
    })
    
    if (logoFile) {
      payload.append('logo', logoFile)
    }

    try {
      await updateSettings(payload).unwrap()
      toast.success('Company settings updated successfully')
      refetch()
    } catch (error) {
      console.error('Failed to update settings', error)
      toast.error('Failed to update settings')
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Company Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your company's core details and branding.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-500" /> General Information
              </CardTitle>
              <CardDescription>Basic company details that appear on documents and the portal.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName"
                    name="companyName" 
                    value={formData.companyName} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Acme Corp" 
                    required 
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="gstNo">GST Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="gstNo"
                      name="gstNo" 
                      value={formData.gstNo} 
                      onChange={handleInputChange} 
                      className="pl-9"
                      placeholder="e.g. 29ABCDE1234F1Z5" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="tenantId"
                      value={settingsRes?.data?.tenantId || ''} 
                      readOnly
                      className="bg-slate-50 dark:bg-slate-800 text-slate-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (settingsRes?.data?.tenantId) {
                          navigator.clipboard.writeText(settingsRes.data.tenantId)
                          toast.success('Tenant ID copied to clipboard')
                        }
                      }}
                      title="Copy Tenant ID"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Use this ID for API integrations or external configurations.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-start gap-6 pt-2">
                  <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-slate-500">
                      Upload your company logo. This will be used in emails, invoices, and other official documents. 
                      Recommended size: 500x500px, max 5MB.
                    </p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Choose Image
                    </Button>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-500" /> Contact Details
              </CardTitle>
              <CardDescription>Where and how clients can reach you.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="email"
                      name="email" 
                      type="email"
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="pl-9"
                      placeholder="contact@company.com" 
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="mobileNo">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="mobileNo"
                      name="mobileNo" 
                      value={formData.mobileNo} 
                      onChange={handleInputChange} 
                      className="pl-9"
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Registered Address</Label>
                <Textarea 
                  id="address"
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  placeholder="Enter full company address..." 
                  className="min-h-[100px] resize-none"
                />
              </div>

            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-slate-500" /> Signature Authority
              </CardTitle>
              <CardDescription>Default signatory for quotations, invoices, and receipts.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="signatureName">Signatory Name</Label>
                  <Input 
                    id="signatureName"
                    name="signatureName" 
                    value={formData.signatureName} 
                    onChange={handleInputChange} 
                    placeholder="e.g. John Doe" 
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label htmlFor="signatureRole">Signatory Role / Designation</Label>
                  <Input 
                    id="signatureRole"
                    name="signatureRole" 
                    value={formData.signatureRole} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Director" 
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 pb-10">
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-[#c23b22] hover:bg-[#a6321d] text-white px-8"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  )
}
