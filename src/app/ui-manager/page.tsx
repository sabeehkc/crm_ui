'use client'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setSelectedWebsiteId } from '@/store/slices/uiManagerSlice'
import { useGetWebsitesQuery, useCreateWebsiteMutation } from '@/store/services/websiteContentSlice'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, Copy, Plus } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

// Import Tabs Components
import ProductsTab from './components/ProductsTab'
import HeroSectionTab from './components/HeroSectionTab'
import ClientsTab from './components/ClientsTab'
import AboutUsTab from './components/AboutUsTab'
import NewsTab from './components/NewsTab'
import ToolsTab from './components/ToolsTab'
import FAQTab from './components/FAQTab'
import toast from 'react-hot-toast'

export default function UIManagerPage() {
  const dispatch = useDispatch();
  const selectedWebsiteId = useSelector((state: RootState) => state.uiManager.selectedWebsiteId);
  const { data: response, isLoading } = useGetWebsitesQuery();
  const websites = response?.data || [];
  const [createWebsite, { isLoading: isCreating }] = useCreateWebsiteMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteDomain, setNewWebsiteDomain] = useState('');

  // Set default website if none selected
  useEffect(() => {
    if (websites.length > 0 && !selectedWebsiteId) {
      dispatch(setSelectedWebsiteId(websites[0]._id));
    }
  }, [websites, selectedWebsiteId, dispatch]);

  const handleCreateWebsite = async () => {
    if (!newWebsiteName.trim()) return;
    try {
      const res = await createWebsite({ name: newWebsiteName, domain: newWebsiteDomain }).unwrap();
      const newSites = res.data;
      if (newSites && newSites.length > 0) {
         dispatch(setSelectedWebsiteId(newSites[0]._id)); // Switch to newly created
      }
      setIsDialogOpen(false);
      setNewWebsiteName('');
      setNewWebsiteDomain('');
    } catch (e) {
      console.error('Failed to create website', e);
    }
  };

  const selectedWebsite = websites.find((w: any) => w._id === selectedWebsiteId);

  // Copy Website id to Clipboard
  const copyWebsiteUrl = () => {
    if (selectedWebsite) {
      navigator.clipboard.writeText(selectedWebsite._id);
      toast.success("Website id copied to clipboard");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-full mx-auto pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">UI Manager</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your public-facing website content</p>
          </div>
          <div className="flex items-center gap-3">
            {
              selectedWebsite && (
                  <Copy className="w-4 h-4 mr-2 cursor-pointer" onClick={copyWebsiteUrl} />
              )
                
            }
            {!isLoading && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[150px] justify-between">
                    {selectedWebsite ? selectedWebsite.name : 'Select Website'}
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {websites.map((site: any) => (
                    <DropdownMenuItem 
                      key={site._id} 
                      onClick={() => dispatch(setSelectedWebsiteId(site._id))}
                      className={site._id === selectedWebsiteId ? 'bg-slate-100 dark:bg-slate-800' : ''}
                    >
                      {site.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#c23b22] hover:bg-[#a6321d] text-white font-medium shadow-sm transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  New Website
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Website</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Website Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. My Main Site" 
                      value={newWebsiteName}
                      onChange={(e) => setNewWebsiteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain (Optional)</Label>
                    <Input 
                      id="domain" 
                      placeholder="e.g. example.com" 
                      value={newWebsiteDomain}
                      onChange={(e) => setNewWebsiteDomain(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateWebsite} 
                    disabled={!newWebsiteName.trim() || isCreating}
                    className="w-full bg-[#c23b22] hover:bg-[#a6321d] text-white"
                  >
                    {isCreating ? 'Creating...' : 'Create Website'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {websites.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium mb-2">No Websites Found</h3>
            <p className="text-muted-foreground mb-4">You need to create a website first to manage its content.</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-[#c23b22] hover:bg-[#a6321d] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Website
            </Button>
          </div>
        )}


        {/* Tabs */}
        {selectedWebsiteId && (
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 justify-start gap-2 mb-2 flex-wrap">
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
            >
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="hero" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
            >
              Hero Section
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
            >
              About Us
            </TabsTrigger>
             <TabsTrigger 
              value="faq" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
            >
              FAQ
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
            >
              News
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-slate-200 dark:data-[state=active]:border-slate-700 rounded-full px-5 py-2 text-sm font-medium transition-colors"
            >
              Tools
            </TabsTrigger>
           
          </TabsList>
          
          <TabsContent value="products" className="outline-none mt-0">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="hero" className="outline-none mt-0">
            <HeroSectionTab />
          </TabsContent>
          <TabsContent value="clients" className="outline-none mt-0">
            <ClientsTab />
          </TabsContent>
          <TabsContent value="about" className="outline-none mt-0">
            <AboutUsTab />
          </TabsContent>
          <TabsContent value="faq" className="outline-none mt-0">
            <FAQTab />
          </TabsContent>
          <TabsContent value="news" className="outline-none mt-0">
            <NewsTab />
          </TabsContent>
          <TabsContent value="tools" className="outline-none mt-0">
            <ToolsTab />
          </TabsContent>
        </Tabs>
        )}

      </div>
    </DashboardLayout>
  )
}
