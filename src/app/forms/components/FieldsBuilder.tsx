'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, GripVertical, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUpdateFormMutation } from '@/store/services/formSlice';
import toast from 'react-hot-toast';

interface Field {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select' | 'rating' | 'date' | 'time' | 'page_break' | 'file';
  required: boolean;
  options?: string[];
}

interface FieldsBuilderProps {
  formId: string;
  initialName?: string;
  initialDescription?: string;
  initialFields?: Field[];
}

export function FieldsBuilder({ formId, initialName = '', initialDescription = '', initialFields = [] }: FieldsBuilderProps) {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [formName, setFormName] = useState(initialName);
  const [formDescription, setFormDescription] = useState(initialDescription || '');
  const [updateForm, { isLoading }] = useUpdateFormMutation();

  const handleAddField = () => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      name: `field_${fields.length + 1}`,
      label: `New Field ${fields.length + 1}`,
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleChange = (id: string, key: keyof Field, value: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const handleSave = async () => {
    try {
      await updateForm({ id: formId, data: { name: formName, description: formDescription, fields } }).unwrap();
      toast.success('Form saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save form.');
    }
  };

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-card  max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-xl font-semibold">Form Builder</CardTitle>
          <CardDescription>Configure the fields that will be displayed on your hosted form.</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="rounded-xl shadow-sm bg-primary gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Fields
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border-2 border-t-8 border-t-primary rounded-xl bg-white shadow-sm space-y-4">
          <Input 
            value={formName} 
            onChange={(e) => setFormName(e.target.value)} 
            className="text-3xl font-bold border-none h-auto px-0 rounded-none focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary/50"
            placeholder="Form Title"
          />
          <Input 
            value={formDescription} 
            onChange={(e) => setFormDescription(e.target.value)} 
            className="text-muted-foreground border-none h-auto px-0 rounded-none focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-primary/50"
            placeholder="Form Description"
          />
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className={`flex items-start gap-4 p-5 border rounded-xl group ${field.type === 'page_break' ? 'bg-primary/5 border-primary/20' : 'bg-white shadow-sm'}`}>
            <div className="mt-3 text-muted-foreground cursor-grab opacity-50 group-hover:opacity-100">
              <GripVertical className="h-5 w-5" />
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
              {field.type === 'page_break' ? (
                <div className="md:col-span-11 space-y-2 flex flex-col justify-center border-b-2 border-dashed pb-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-primary/20 rounded text-primary flex items-center justify-center font-bold text-xs">P</div>
                    <span className="font-semibold text-lg">Section Break</span>
                  </div>
                  <Input
                    value={field.label}
                    onChange={(e) => handleChange(field.id, 'label', e.target.value)}
                    className="rounded-lg h-10 border-none font-medium"
                    placeholder="Section Title (Optional)"
                  />
                </div>
              ) : (
                <>
                  <div className="md:col-span-4 space-y-2">
                    <Input
                      value={field.label}
                      onChange={(e) => handleChange(field.id, 'label', e.target.value)}
                      className="rounded-lg h-12 bg-muted/30 font-medium"
                      placeholder="Question"
                    />
                  </div>
                  
                  <div className="md:col-span-3 space-y-2">
                    <Select value={field.type} onValueChange={(v) => handleChange(field.id, 'type', v)}>
                      <SelectTrigger className="rounded-lg h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Short Text</SelectItem>
                        <SelectItem value="textarea">Paragraph</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="checkbox">Checkboxes</SelectItem>
                        <SelectItem value="radio">Multiple Choice</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="rating">Rating (Stars)</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                        <SelectItem value="page_break">Section Break</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Input
                      value={field.name}
                      onChange={(e) => handleChange(field.id, 'name', e.target.value)}
                      className="rounded-lg h-12 font-mono text-xs bg-muted/20"
                      placeholder="API Key"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2 flex flex-row justify-center items-center gap-2 pt-2">
                    <Label className="text-sm font-medium">Required</Label>
                    <Switch
                      checked={field.required}
                      onCheckedChange={(v) => handleChange(field.id, 'required', v)}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-1 space-y-2 flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => handleRemoveField(field.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {['select', 'radio', 'checkbox'].includes(field.type) && (
                <div className="md:col-span-12 space-y-2 mt-2 border-t pt-4">
                  <Label className="text-xs text-muted-foreground font-semibold">Options (comma separated)</Label>
                  <Input
                    value={field.options?.join(', ') || ''}
                    onChange={(e) => handleChange(field.id, 'options', e.target.value.split(',').map((s) => s.trim()))}
                    className="rounded-lg h-10 bg-muted/10"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
            <p className="text-sm text-muted-foreground mb-4">No fields added yet. Your form needs some fields!</p>
          </div>
        )}
        <Button variant="outline" onClick={handleAddField} className="w-full border-dashed rounded-xl gap-2 mt-4">
          <Plus className="h-4 w-4" /> Add Field
        </Button>
      </CardContent>
    </Card>
  );
}
