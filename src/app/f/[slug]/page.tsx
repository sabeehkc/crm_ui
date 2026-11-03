'use client';

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { BASE_URL, FORM_URL } from '@/store/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Field {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select' | 'rating' | 'date' | 'time' | 'page_break' | 'file';
  required: boolean;
  options?: string[];
}

interface FormConfig {
  name: string;
  description:string;
  slug: string;
  fields: Field[];
  recaptchaEnabled: boolean;
  successMessage: string;
  redirectUrl?: string;
  accessKey: string;
}

export default function HostedFormPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(0);

  // Group fields into pages based on page_break
  const pages = useMemo(() => {
    if (!formConfig?.fields) return [];
    const result: Field[][] = [[]];
    let pageIndex = 0;

    formConfig.fields.forEach((field) => {
      if (field.type === 'page_break') {
        result.push([]);
        pageIndex++;
      } else {
        result[pageIndex].push(field);
      }
    });
    return result;
  }, [formConfig?.fields]);

  const currentFields = pages[currentPage] || [];
  const isLastPage = currentPage === pages.length - 1;

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    // Basic validation for required fields on current page
    const missingRequired = currentFields.find(
      (f) => f.required && (!formData[f.name] || formData[f.name] === '')
    );
    if (missingRequired) {
      toast.error(`Please fill out the required field: ${missingRequired.label}`);
      return;
    }
    setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((p) => Math.max(p - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${BASE_URL}${FORM_URL}/public/${slug}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Form not found');
        setFormConfig(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchForm();
  }, [slug]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formConfig) return;

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formPayload.append(key, value);
        }
      });
      formPayload.append('access_key', formConfig.accessKey);
      formPayload.append('botcheck', 'false');

      // Mock reCAPTCHA token if required
      if (formConfig.recaptchaEnabled) {
        formPayload.append('g-recaptcha-response', 'mock-token-from-hosted-form');
      }

      const res = await fetch(`${BASE_URL}${FORM_URL}/submit`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formPayload,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Submission failed');
      }

      setIsSuccess(true);
      toast.success(formConfig.successMessage || 'Form submitted successfully!');

      if (formConfig.redirectUrl) {
        setTimeout(() => {
          window.location.href = formConfig.redirectUrl!;
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="w-full max-w-md shadow-lg border-none rounded-2xl mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Form Error</h2>
            <p className="text-muted-foreground">{error || 'Form not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/10 p-4">
        <Card className="w-full max-w-md shadow-xl border-none rounded-3xl overflow-hidden bg-white dark:bg-card">
          <CardContent className="pt-10 pb-10 text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{formConfig.successMessage || 'Thank you!'}</h2>
            <p className="text-muted-foreground">Your submission has been received.</p>
            {formConfig.redirectUrl && (
              <p className="text-xs text-muted-foreground mt-4 animate-pulse">Redirecting...</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex justify-center items-start">
      <Card className="w-full max-w-2xl shadow-xl border-border/50 rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="bg-primary/5 dark:bg-primary/10 px-8 py-10 border-b border-border/50 relative">
          {pages.length > 1 && (
            <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out" 
                style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
              />
            </div>
          )}
          <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
            {formConfig.name}
          </CardTitle>
          {formConfig.description && (
            <CardDescription className="mt-3 text-base text-foreground/80 whitespace-pre-wrap">
              {formConfig.description}
            </CardDescription>
          )}
        </div>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentFields.length > 0 ? (
              currentFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                    <Input
                      type={field.type}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="rounded-xl h-12 bg-muted/30 focus-visible:ring-primary/50 transition-all"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'date' ? (
                    <Input
                      type="date"
                      required={field.required}
                      className="rounded-xl h-12 bg-muted/30 focus-visible:ring-primary/50 transition-all w-full sm:w-auto"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'time' ? (
                    <Input
                      type="time"
                      required={field.required}
                      className="rounded-xl h-12 bg-muted/30 focus-visible:ring-primary/50 transition-all w-full sm:w-auto"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'file' ? (
                    <div className="mt-2">
                      <Input
                        type="file"
                        required={field.required}
                        className="rounded-xl h-12 bg-muted/30 focus-visible:ring-primary/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files ? e.target.files[0] : null;
                          handleFileChange(field.name, file);
                        }}
                      />
                    </div>
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="rounded-xl min-h-[120px] bg-muted/30 focus-visible:ring-primary/50 transition-all"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <Select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onValueChange={(val: string) => handleInputChange(field.name, val)}
                    >
                      <SelectTrigger className="rounded-xl h-12 bg-muted/30 focus-visible:ring-primary/50">
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt} className="rounded-lg">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'radio' ? (
                    <RadioGroup
                      required={field.required}
                      value={formData[field.name] || ''}
                      onValueChange={(val: string) => handleInputChange(field.name, val)}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      {field.options?.map((opt) => (
                        <div key={opt} className="flex items-center space-x-3 border p-3 rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors">
                          <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                          <Label htmlFor={`${field.id}-${opt}`} className="font-medium cursor-pointer flex-1">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center space-x-3 mt-2 p-3 border rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors">
                      <Checkbox
                        id={field.id}
                        required={field.required}
                        checked={formData[field.name] || false}
                        onCheckedChange={(checked: any) => handleInputChange(field.name, checked)}
                      />
                      <Label htmlFor={field.id} className="font-medium cursor-pointer leading-none flex-1">
                        {field.label}
                      </Label>
                    </div>
                  ) : field.type === 'rating' ? (
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-10 w-10 cursor-pointer transition-colors ${
                            (formData[field.name] || 0) >= star
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground/30 hover:text-yellow-400/50'
                          }`}
                          onClick={() => handleInputChange(field.name, star)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                This form has no fields configured.
              </div>
            )}

            <div className="pt-6 flex items-center justify-between gap-4">
              {currentPage > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevPage}
                  className="h-14 rounded-xl text-lg font-bold shadow-sm px-6 hover:bg-muted/50 transition-all"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              
              {!isLastPage ? (
                <Button
                  type="button"
                  onClick={handleNextPage}
                  className="flex-1 h-14 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || currentFields.length === 0}
                  className="flex-1 h-14 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Powered by <span className="font-semibold text-foreground">CRM Forms</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
