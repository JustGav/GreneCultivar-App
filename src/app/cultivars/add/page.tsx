
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { mockCultivars } from '@/lib/mock-data';
import type { Cultivar, Genetics, CannabinoidProfile, AdditionalFileInfo, AdditionalInfoCategoryKey, YieldProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Leaf, Percent, Edit3, Clock, ImageIcon, FileText, Award, FlaskConical, Sprout, Combine, Droplets, BarChartBig, Paperclip, Info, PlusCircle, Trash2 } from 'lucide-react';

const GENETIC_OPTIONS: Genetics[] = ['Sativa', 'Indica', 'Ruderalis', 'Hybrid'];

const numberRangeSchema = z.object({
  min: z.coerce.number().min(0, "Min must be >= 0").max(100, "Min must be <= 100").optional(),
  max: z.coerce.number().min(0, "Max must be >= 0").max(100, "Max must be <= 100").optional(),
}).refine(data => (data.min === undefined || data.max === undefined) || data.min <= data.max, {
  message: "Min value must be less than or equal to Max value",
  path: ["min"], 
});

const yieldRangeSchema = z.object({
  min: z.coerce.number().min(0, "Min must be >= 0").optional(),
  max: z.coerce.number().min(0, "Max must be >= 0").optional(),
}).refine(data => (data.min === undefined || data.max === undefined) || data.min <= data.max, {
  message: "Min value must be less than or equal to Max value",
  path: ["min"],
});

const additionalFileSchema = z.object({
  name: z.string().min(1, "File name is required."),
  url: z.string().url({ message: "Please enter a valid URL." }),
});

const additionalImageFileSchema = additionalFileSchema.extend({
  dataAiHint: z.string().optional(),
});


const cultivarFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  genetics: z.enum(GENETIC_OPTIONS, { required_error: "Genetics type is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  effects: z.string().optional(), // Comma-separated
  
  thc: numberRangeSchema,
  cbd: numberRangeSchema,
  cbc: numberRangeSchema.optional(),
  cbg: numberRangeSchema.optional(),
  cbn: numberRangeSchema.optional(),
  thcv: numberRangeSchema.optional(),

  primaryImageUrl: z.string().url({ message: "Please enter a valid URL for the primary image." }).optional().or(z.literal('')),
  primaryImageAlt: z.string().optional(),
  primaryImageDataAiHint: z.string().optional(),

  cultivationPhases: z.object({
    rooting: z.string().optional(),
    vegetative: z.string().optional(),
    flowering: z.string().optional(),
    harvest: z.string().optional(),
  }).optional(),

  plantCharacteristics: z.object({
    minHeight: z.coerce.number().min(0).optional(),
    maxHeight: z.coerce.number().min(0).optional(),
    minMoisture: z.coerce.number().min(0).max(100).optional(),
    maxMoisture: z.coerce.number().min(0).max(100).optional(),
    yieldPerPlant: yieldRangeSchema.optional(),
    yieldPerWatt: yieldRangeSchema.optional(),
    yieldPerM2: yieldRangeSchema.optional(),
  }).optional(),
  
  additionalInfo_geneticCertificates: z.array(additionalFileSchema).optional(),
  additionalInfo_plantPictures: z.array(additionalImageFileSchema).optional(),
  additionalInfo_cannabinoidInfos: z.array(additionalFileSchema).optional(),
  additionalInfo_terpeneInfos: z.array(additionalFileSchema).optional(),
});

type CultivarFormData = z.infer<typeof cultivarFormSchema>;

export default function AddCultivarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, register, formState: { errors } } = useForm<CultivarFormData>({
    resolver: zodResolver(cultivarFormSchema),
    defaultValues: {
      name: '',
      genetics: undefined,
      description: '',
      effects: '',
      thc: { min: undefined, max: undefined },
      cbd: { min: undefined, max: undefined },
      primaryImageUrl: '',
      primaryImageAlt: '',
      cultivationPhases: {},
      plantCharacteristics: {
        yieldPerPlant: {},
        yieldPerM2: {},
        yieldPerWatt: {}
      },
      additionalInfo_geneticCertificates: [],
      additionalInfo_plantPictures: [],
      additionalInfo_cannabinoidInfos: [],
      additionalInfo_terpeneInfos: [],
    },
  });

  const { fields: geneticCertificateFields, append: appendGeneticCertificate, remove: removeGeneticCertificate } = useFieldArray({ control, name: "additionalInfo_geneticCertificates" });
  const { fields: plantPictureFields, append: appendPlantPicture, remove: removePlantPicture } = useFieldArray({ control, name: "additionalInfo_plantPictures" });
  const { fields: cannabinoidInfoFields, append: appendCannabinoidInfo, remove: removeCannabinoidInfo } = useFieldArray({ control, name: "additionalInfo_cannabinoidInfos" });
  const { fields: terpeneInfoFields, append: appendTerpeneInfo, remove: removeTerpeneInfo } = useFieldArray({ control, name: "additionalInfo_terpeneInfos" });


  const onSubmit = (data: CultivarFormData) => {
    setIsLoading(true);
    try {
      const newCultivarId = Date.now().toString() + Math.random().toString(36).substring(2,7);
      
      const newCultivar: Cultivar = {
        id: newCultivarId,
        name: data.name,
        genetics: data.genetics,
        thc: data.thc as CannabinoidProfile,
        cbd: data.cbd as CannabinoidProfile,
        cbc: data.cbc?.min !== undefined || data.cbc?.max !== undefined ? data.cbc as CannabinoidProfile : undefined,
        cbg: data.cbg?.min !== undefined || data.cbg?.max !== undefined ? data.cbg as CannabinoidProfile : undefined,
        cbn: data.cbn?.min !== undefined || data.cbn?.max !== undefined ? data.cbn as CannabinoidProfile : undefined,
        thcv: data.thcv?.min !== undefined || data.thcv?.max !== undefined ? data.thcv as CannabinoidProfile : undefined,
        effects: data.effects ? data.effects.split(',').map(e => e.trim()).filter(e => e) : [],
        description: data.description,
        images: data.primaryImageUrl ? [{ 
            id: `img-${newCultivarId}-1`, 
            url: data.primaryImageUrl, 
            alt: data.primaryImageAlt || `${data.name} primary image`,
            'data-ai-hint': data.primaryImageDataAiHint
        }] : [],
        reviews: [],
        cultivationPhases: data.cultivationPhases,
        plantCharacteristics: {
            minHeight: data.plantCharacteristics?.minHeight,
            maxHeight: data.plantCharacteristics?.maxHeight,
            minMoisture: data.plantCharacteristics?.minMoisture,
            maxMoisture: data.plantCharacteristics?.maxMoisture,
            yieldPerPlant: data.plantCharacteristics?.yieldPerPlant?.min !== undefined || data.plantCharacteristics?.yieldPerPlant?.max !== undefined ? data.plantCharacteristics.yieldPerPlant as YieldProfile : undefined,
            yieldPerWatt: data.plantCharacteristics?.yieldPerWatt?.min !== undefined || data.plantCharacteristics?.yieldPerWatt?.max !== undefined ? data.plantCharacteristics.yieldPerWatt as YieldProfile : undefined,
            yieldPerM2: data.plantCharacteristics?.yieldPerM2?.min !== undefined || data.plantCharacteristics?.yieldPerM2?.max !== undefined ? data.plantCharacteristics.yieldPerM2 as YieldProfile : undefined,
        },
        additionalInfo: {},
      };
      
      const processAdditionalInfoCategory = (
        formDataArray: { name: string; url: string; dataAiHint?: string }[] | undefined,
        categoryKey: AdditionalInfoCategoryKey,
        fileType: 'image' | 'pdf' | 'document'
      ): AdditionalFileInfo[] => {
        if (!formDataArray || formDataArray.length === 0) {
          return [];
        }
        return formDataArray
          .filter(item => item.url && item.name) 
          .map((item, index) => ({
            id: `addinf-${categoryKey.substring(0,2)}-${newCultivarId}-${index}`,
            name: item.name,
            url: item.url,
            fileType: fileType,
            category: categoryKey,
            ...(fileType === 'image' && item.dataAiHint && { 'data-ai-hint': item.dataAiHint }),
        }));
      };

      if (!newCultivar.additionalInfo) newCultivar.additionalInfo = {};
      newCultivar.additionalInfo.geneticCertificate = processAdditionalInfoCategory(data.additionalInfo_geneticCertificates, 'geneticCertificate', 'pdf');
      newCultivar.additionalInfo.plantPicture = processAdditionalInfoCategory(data.additionalInfo_plantPictures, 'plantPicture', 'image');
      newCultivar.additionalInfo.cannabinoidInfo = processAdditionalInfoCategory(data.additionalInfo_cannabinoidInfos, 'cannabinoidInfo', 'pdf');
      newCultivar.additionalInfo.terpeneInfo = processAdditionalInfoCategory(data.additionalInfo_terpeneInfos, 'terpeneInfo', 'pdf');


      mockCultivars.unshift(newCultivar);

      toast({
        title: "Cultivar Added!",
        description: `${data.name} has been successfully added.`,
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to add cultivar:", error);
      toast({
        title: "Error",
        description: "Failed to add cultivar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMinMaxInput = (fieldPrefix: keyof CultivarFormData | `plantCharacteristics.${string}`, label: string, subLabel?: string) => (
    <div className="grid grid-cols-2 gap-4 items-end">
      <div>
        <Label htmlFor={`${String(fieldPrefix)}.min`}>{label} Min {subLabel}</Label>
        <Input id={`${String(fieldPrefix)}.min`} type="number" step="0.1" {...register(`${String(fieldPrefix)}.min` as any)} placeholder="e.g., 18.0" />
        {/* @ts-ignore */}
        {errors[fieldPrefix as keyof CultivarFormData]?.min && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix as keyof CultivarFormData]?.min?.message}</p>}
        {/* @ts-ignore Handle path errors for nested objects */}
        {fieldPrefix.includes('.') && errors[fieldPrefix.split('.')[0] as keyof CultivarFormData]?.[fieldPrefix.split('.')[1] as any]?.min && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix.split('.')[0]as keyof CultivarFormData]?.[fieldPrefix.split('.')[1]as any]?.min?.message}</p>}
        {/* @ts-ignore */}
        {errors[fieldPrefix as keyof CultivarFormData]?.message && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix as keyof CultivarFormData]?.message}</p>}
      </div>
      <div>
        <Label htmlFor={`${String(fieldPrefix)}.max`}>{label} Max {subLabel}</Label>
        <Input id={`${String(fieldPrefix)}.max`} type="number" step="0.1" {...register(`${String(fieldPrefix)}.max` as any)} placeholder="e.g., 22.5" />
        {/* @ts-ignore */}
        {errors[fieldPrefix as keyof CultivarFormData]?.max && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix as keyof CultivarFormData]?.max?.message}</p>}
         {/* @ts-ignore */}
        {fieldPrefix.includes('.') && errors[fieldPrefix.split('.')[0]as keyof CultivarFormData]?.[fieldPrefix.split('.')[1]as any]?.max && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix.split('.')[0]as keyof CultivarFormData]?.[fieldPrefix.split('.')[1]as any]?.max?.message}</p>}
      </div>
    </div>
  );
  
  // @ts-ignore
  const getNestedError = (fieldName) => {
    const parts = fieldName.split('.');
    let currentError = errors;
    for (const part of parts) {
      if (currentError && currentError[part]) {
        // @ts-ignore
        currentError = currentError[part];
      } else {
        return null;
      }
    }
    return currentError;
  };


  return (
    <div className="space-y-8 animate-fadeIn">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6 font-medium">
        <ArrowLeft size={20} className="mr-1" />
        Back to Cultivar Browser
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary flex items-center"><Edit3 size={30} className="mr-3" /> Add New Cultivar</CardTitle>
            <CardDescription>Fill in the details for the new cultivar. Fields marked with * are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Cultivar Name *</Label>
              <Input id="name" {...register("name")} placeholder="e.g., GreenLeaf Serenity" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Genetics *</Label>
              <Controller
                name="genetics"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 mt-2">
                    {GENETIC_OPTIONS.map(option => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`genetics-${option}`} />
                        <Label htmlFor={`genetics-${option}`} className="font-normal">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.genetics && <p className="text-sm text-destructive mt-1">{errors.genetics.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" {...register("description")} placeholder="Describe the cultivar..." rows={4} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <Label htmlFor="effects">Effects (comma-separated)</Label>
              <Input id="effects" {...register("effects")} placeholder="e.g., Relaxed, Happy, Uplifted" />
              {errors.effects && <p className="text-sm text-destructive mt-1">{errors.effects.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Percent size={24} className="mr-2" /> Cannabinoid Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderMinMaxInput("thc", "THC", "(%) *")}
            {renderMinMaxInput("cbd", "CBD", "(%) *")}
            {renderMinMaxInput("cbc", "CBC", "(%)")}
            {renderMinMaxInput("cbg", "CBG", "(%)")}
            {renderMinMaxInput("cbn", "CBN", "(%)")}
            {renderMinMaxInput("thcv", "THCV", "(%)")}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><ImageIcon size={24} className="mr-2" /> Primary Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="primaryImageUrl">Primary Image URL</Label>
                <Input id="primaryImageUrl" type="url" {...register("primaryImageUrl")} placeholder="https://placehold.co/600x400.png" />
                {errors.primaryImageUrl && <p className="text-sm text-destructive mt-1">{errors.primaryImageUrl.message}</p>}
            </div>
            <div>
                <Label htmlFor="primaryImageAlt">Primary Image Alt Text</Label>
                <Input id="primaryImageAlt" {...register("primaryImageAlt")} placeholder="e.g., Close-up of [Cultivar Name] bud" />
                {errors.primaryImageAlt && <p className="text-sm text-destructive mt-1">{errors.primaryImageAlt.message}</p>}
            </div>
             <div>
                <Label htmlFor="primaryImageDataAiHint">Primary Image AI Hint (keywords)</Label>
                <Input id="primaryImageDataAiHint" {...register("primaryImageDataAiHint")} placeholder="e.g., cannabis bud" />
                {errors.primaryImageDataAiHint && <p className="text-sm text-destructive mt-1">{errors.primaryImageDataAiHint.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Clock size={24} className="mr-2" /> Cultivation Phases</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="cultivationPhases.rooting">Rooting Phase Duration</Label>
              <Input id="cultivationPhases.rooting" {...register("cultivationPhases.rooting")} placeholder="e.g., 7-14 days" />
              {errors.cultivationPhases?.rooting && <p className="text-sm text-destructive mt-1">{errors.cultivationPhases.rooting.message}</p>}
            </div>
            <div>
              <Label htmlFor="cultivationPhases.vegetative">Vegetative Phase Duration</Label>
              <Input id="cultivationPhases.vegetative" {...register("cultivationPhases.vegetative")} placeholder="e.g., 4-6 weeks" />
              {errors.cultivationPhases?.vegetative && <p className="text-sm text-destructive mt-1">{errors.cultivationPhases.vegetative.message}</p>}
            </div>
            <div>
              <Label htmlFor="cultivationPhases.flowering">Flowering Phase Duration</Label>
              <Input id="cultivationPhases.flowering" {...register("cultivationPhases.flowering")} placeholder="e.g., 8-9 weeks" />
              {errors.cultivationPhases?.flowering && <p className="text-sm text-destructive mt-1">{errors.cultivationPhases.flowering.message}</p>}
            </div>
            <div>
              <Label htmlFor="cultivationPhases.harvest">Harvest Phase Information</Label>
              <Input id="cultivationPhases.harvest" {...register("cultivationPhases.harvest")} placeholder="e.g., After 8-9 weeks of flowering" />
              {errors.cultivationPhases?.harvest && <p className="text-sm text-destructive mt-1">{errors.cultivationPhases.harvest.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><Sprout size={24} className="mr-2" /> Plant Characteristics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <Label className="font-medium mb-1 block">Plant Height (cm)</Label>
                        {renderMinMaxInput("plantCharacteristics.minHeight" as any, "Min Height", "")}
                         {/* @ts-ignore */}
                        {getNestedError("plantCharacteristics.minHeight")?.message && <p className="text-sm text-destructive mt-1">{getNestedError("plantCharacteristics.minHeight")?.message}</p>}
                    </div>
                     <div>
                        <Label className="font-medium mb-1 block">Max Height (cm)</Label> {/* Changed Label for clarity */}
                        <Input id="plantCharacteristics.maxHeight" type="number" step="0.1" {...register("plantCharacteristics.maxHeight")} placeholder="e.g., 120" />
                         {/* @ts-ignore */}
                        {getNestedError("plantCharacteristics.maxHeight")?.message && <p className="text-sm text-destructive mt-1">{getNestedError("plantCharacteristics.maxHeight")?.message}</p>}
                    </div>
                </div>
                 <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                     <div>
                        <Label className="font-medium mb-1 block">Dry Product Moisture (%)</Label>
                         {renderMinMaxInput("plantCharacteristics.minMoisture" as any, "Min Moisture", "")}
                          {/* @ts-ignore */}
                         {getNestedError("plantCharacteristics.minMoisture")?.message && <p className="text-sm text-destructive mt-1">{getNestedError("plantCharacteristics.minMoisture")?.message}</p>}
                    </div>
                     <div>
                        <Label className="font-medium mb-1 block">Max Moisture (%)</Label> {/* Changed Label for clarity */}
                         <Input id="plantCharacteristics.maxMoisture" type="number" step="0.1" {...register("plantCharacteristics.maxMoisture")} placeholder="e.g., 12" />
                          {/* @ts-ignore */}
                         {getNestedError("plantCharacteristics.maxMoisture")?.message && <p className="text-sm text-destructive mt-1">{getNestedError("plantCharacteristics.maxMoisture")?.message}</p>}
                    </div>
                </div>
                <Separator />
                <div>
                    <Label className="font-medium mb-2 block">Estimated Yield</Label>
                    <div className="space-y-4">
                        {renderMinMaxInput("plantCharacteristics.yieldPerPlant" as any, "Yield/Plant", "(g)")}
                        {renderMinMaxInput("plantCharacteristics.yieldPerWatt" as any, "Yield/Watt", "(g/W)")}
                        {renderMinMaxInput("plantCharacteristics.yieldPerM2" as any, "Yield/m²", "(g/m²)")}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><Paperclip size={28} className="mr-3"/> Additional Information</CardTitle>
                <CardDescription>Provide URLs for relevant documents or images. Add multiple files if needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Genetic Certificates */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><Award size={18} className="mr-2 text-accent"/>Genetic Certificates</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendGeneticCertificate({ name: '', url: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Certificate
                        </Button>
                    </div>
                    {geneticCertificateFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_geneticCertificates.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_geneticCertificates.${index}.name`)} placeholder="Certificate Name" />
                                     {/* @ts-ignore */}
                                    {errors.additionalInfo_geneticCertificates?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_geneticCertificates?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_geneticCertificates.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_geneticCertificates.${index}.url`)} placeholder="https://example.com/cert.pdf" />
                                     {/* @ts-ignore */}
                                    {errors.additionalInfo_geneticCertificates?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_geneticCertificates?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:bg-destructive/10" onClick={() => removeGeneticCertificate(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     {geneticCertificateFields.length === 0 && <p className="text-sm text-muted-foreground">No genetic certificates added yet.</p>}
                </div>
                <Separator />

                {/* Plant Pictures */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><ImageIcon size={18} className="mr-2 text-accent"/>Plant Pictures</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendPlantPicture({ name: '', url: '', dataAiHint: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Picture
                        </Button>
                    </div>
                    {plantPictureFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_plantPictures.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_plantPictures.${index}.name`)} placeholder="Picture Name" />
                                    {/* @ts-ignore */}
                                    {errors.additionalInfo_plantPictures?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_plantPictures?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_plantPictures.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_plantPictures.${index}.url`)} placeholder="https://example.com/image.jpg" />
                                    {/* @ts-ignore */}
                                    {errors.additionalInfo_plantPictures?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_plantPictures?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <div className="mt-2">
                                <Label htmlFor={`additionalInfo_plantPictures.${index}.dataAiHint`}>Image AI Hint (keywords)</Label>
                                <Input {...register(`additionalInfo_plantPictures.${index}.dataAiHint`)} placeholder="e.g. cannabis bud, trichome macro" />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:bg-destructive/10" onClick={() => removePlantPicture(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {plantPictureFields.length === 0 && <p className="text-sm text-muted-foreground">No plant pictures added yet.</p>}
                </div>
                <Separator />

                {/* Cannabinoid Info */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><FileText size={18} className="mr-2 text-accent"/>Cannabinoid Information</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendCannabinoidInfo({ name: '', url: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Cannabinoid Info
                        </Button>
                    </div>
                    {cannabinoidInfoFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_cannabinoidInfos.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_cannabinoidInfos.${index}.name`)} placeholder="Cannabinoid Report Name" />
                                    {/* @ts-ignore */}
                                    {errors.additionalInfo_cannabinoidInfos?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_cannabinoidInfos?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_cannabinoidInfos.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_cannabinoidInfos.${index}.url`)} placeholder="https://example.com/cannabinoid.pdf" />
                                    {/* @ts-ignore */}
                                    {errors.additionalInfo_cannabinoidInfos?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_cannabinoidInfos?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:bg-destructive/10" onClick={() => removeCannabinoidInfo(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {cannabinoidInfoFields.length === 0 && <p className="text-sm text-muted-foreground">No cannabinoid information added yet.</p>}
                </div>
                <Separator />
                
                {/* Terpene Info */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><FlaskConical size={18} className="mr-2 text-accent"/>Terpene Information</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTerpeneInfo({ name: '', url: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Terpene Info
                        </Button>
                    </div>
                    {terpeneInfoFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_terpeneInfos.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_terpeneInfos.${index}.name`)} placeholder="Terpene Report Name" />
                                    {/* @ts-ignore */}
                                    {errors.additionalInfo_terpeneInfos?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_terpeneInfos?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_terpeneInfos.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_terpeneInfos.${index}.url`)} placeholder="https://example.com/terpene.pdf" />
                                    {/* @ts-ignore */}
                                    {errors.additionalInfo_terpeneInfos?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_terpeneInfos?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive hover:bg-destructive/10" onClick={() => removeTerpeneInfo(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {terpeneInfoFields.length === 0 && <p className="text-sm text-muted-foreground">No terpene information added yet.</p>}
                </div>
            </CardContent>
        </Card>


        <CardFooter className="pt-6 border-t">
          <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isLoading}>
            {isLoading ? 'Adding Cultivar...' : 'Add Cultivar'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}

