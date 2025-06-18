
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { mockCultivars, groupTerpenesByCategory, EFFECT_OPTIONS, MEDICAL_EFFECT_OPTIONS } from '@/lib/mock-data';
import type { Cultivar, Genetics, CannabinoidProfile, AdditionalFileInfo, AdditionalInfoCategoryKey, YieldProfile, Terpene, PricingProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, Leaf, Percent, Edit3, Clock, ImageIcon, FileText, Award, FlaskConical, Sprout, Combine, Droplets, BarChartBig, Paperclip, Info, PlusCircle, Trash2, Palette, DollarSign, Sunrise, Smile, Stethoscope } from 'lucide-react';

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
  id: z.string().optional(), // for useFieldArray key
  name: z.string().min(1, "File name is required."),
  url: z.string().url({ message: "Please enter a valid URL." }),
});

const additionalImageFileSchema = additionalFileSchema.extend({
  dataAiHint: z.string().optional(),
});

const terpeneEntrySchema = z.object({
  id: z.string().optional(), // for useFieldArray key
  name: z.string().min(1, "Terpene name is required."),
  percentage: z.coerce.number().min(0, "Percentage must be >=0").max(100, "Percentage must be <=100").optional(),
  description: z.string().optional(),
});

const pricingSchema = z.object({
    min: z.coerce.number().min(0, "Min price must be >= 0.").optional(),
    max: z.coerce.number().min(0, "Max price must be >= 0.").optional(),
    avg: z.coerce.number().min(0, "Avg price must be >= 0.").optional(),
  }).refine(data => {
    if (data.min !== undefined && data.max !== undefined) {
      return data.min <= data.max;
    }
    return true;
  }, {
    message: "Min price must be less than or equal to Max price.",
    path: ["max"], 
  }).optional();

const effectEntrySchema = z.object({
  id: z.string().optional(), // for useFieldArray key
  name: z.string().min(1, "Effect name is required."),
});

const cultivarFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  genetics: z.enum(GENETIC_OPTIONS, { required_error: "Genetics type is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  
  effects: z.array(effectEntrySchema).optional().default([]), 
  medicalEffects: z.array(effectEntrySchema).optional().default([]),
  
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
    germination: z.string().optional(),
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

  terpeneProfile: z.array(terpeneEntrySchema).optional(),
  pricing: pricingSchema,
});

type CultivarFormData = z.infer<typeof cultivarFormSchema>;

const categorizedTerpenes = groupTerpenesByCategory();

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
      effects: [],
      medicalEffects: [],
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
      terpeneProfile: [],
      pricing: { min: undefined, max: undefined, avg: undefined },
    },
  });

  const { fields: effectFields, append: appendEffect, remove: removeEffect } = useFieldArray({ control, name: "effects" });
  const { fields: medicalEffectFields, append: appendMedicalEffect, remove: removeMedicalEffect } = useFieldArray({ control, name: "medicalEffects" });
  const { fields: geneticCertificateFields, append: appendGeneticCertificate, remove: removeGeneticCertificate } = useFieldArray({ control, name: "additionalInfo_geneticCertificates" });
  const { fields: plantPictureFields, append: appendPlantPicture, remove: removePlantPicture } = useFieldArray({ control, name: "additionalInfo_plantPictures" });
  const { fields: cannabinoidInfoFields, append: appendCannabinoidInfo, remove: removeCannabinoidInfo } = useFieldArray({ control, name: "additionalInfo_cannabinoidInfos" });
  const { fields: terpeneInfoFields, append: appendTerpeneInfo, remove: removeTerpeneInfo } = useFieldArray({ control, name: "additionalInfo_terpeneInfos" });
  const { fields: terpeneProfileFields, append: appendTerpene, remove: removeTerpene } = useFieldArray({ control, name: "terpeneProfile" });


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
        effects: data.effects ? data.effects.map(e => e.name).filter(e => e) : [],
        medicalEffects: data.medicalEffects ? data.medicalEffects.map(e => e.name).filter(e => e) : [],
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
        terpeneProfile: data.terpeneProfile?.map((tp, index) => ({ 
            id: `terp-${newCultivarId}-${index}`,
            name: tp.name,
            percentage: tp.percentage,
            description: tp.description,
        })) || [],
        pricing: (data.pricing?.min !== undefined || data.pricing?.max !== undefined || data.pricing?.avg !== undefined)
          ? {
              min: data.pricing.min,
              max: data.pricing.max,
              avg: data.pricing.avg,
            }
          : undefined,
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
  
  const renderMinMaxInput = (fieldPrefix: keyof CultivarFormData | `plantCharacteristics.${string}` | `pricing`, label: string, subLabel?: string) => (
    <div className="grid grid-cols-2 gap-4 items-end">
      <div>
        <Label htmlFor={`${String(fieldPrefix)}.min`}>{label} Min {subLabel}</Label>
        <Input id={`${String(fieldPrefix)}.min`} type="number" step="0.1" {...register(`${String(fieldPrefix)}.min` as any)} placeholder="e.g., 18.0" />
        {/* @ts-ignore */}
        {errors[fieldPrefix as keyof CultivarFormData]?.min && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix as keyof CultivarFormData]?.min?.message}</p>}
        {/* @ts-ignore */}
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
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><Smile size={24} className="mr-2" /> Reported Effects</CardTitle>
                <CardDescription>Select the common effects experienced with this cultivar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {effectFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md relative bg-muted/30 shadow-sm">
                        <div className="flex-grow">
                            <Label htmlFor={`effects.${index}.name`}>Effect *</Label>
                            <Controller
                                name={`effects.${index}.name`}
                                control={control}
                                defaultValue=""
                                render={({ field: controllerField }) => (
                                    <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an effect" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EFFECT_OPTIONS.map(effectName => (
                                                <SelectItem key={effectName} value={effectName}>
                                                    {effectName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.effects?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.effects?.[index]?.name?.message}</p>}
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeEffect(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendEffect({ name: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Effect
                </Button>
                {effectFields.length === 0 && <p className="text-sm text-muted-foreground">No reported effects added yet.</p>}
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><Stethoscope size={24} className="mr-2" /> Potential Medical Effects</CardTitle>
                <CardDescription>Select potential medical applications or benefits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {medicalEffectFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md relative bg-muted/30 shadow-sm">
                        <div className="flex-grow">
                            <Label htmlFor={`medicalEffects.${index}.name`}>Medical Effect *</Label>
                            <Controller
                                name={`medicalEffects.${index}.name`}
                                control={control}
                                defaultValue=""
                                render={({ field: controllerField }) => (
                                    <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a medical effect" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEDICAL_EFFECT_OPTIONS.map(effectName => (
                                                <SelectItem key={effectName} value={effectName}>
                                                    {effectName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.medicalEffects?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.medicalEffects?.[index]?.name?.message}</p>}
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeMedicalEffect(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendMedicalEffect({ name: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Medical Effect
                </Button>
                {medicalEffectFields.length === 0 && <p className="text-sm text-muted-foreground">No medical effects added yet.</p>}
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
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Palette size={24} className="mr-2" /> Terpene Profile</CardTitle>
            <CardDescription>List the prominent terpenes and their optional percentage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {terpeneProfileFields.map((field, index) => (
              <div key={field.id} className="space-y-3 p-4 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <Label htmlFor={`terpeneProfile.${index}.name`}>Terpene Name *</Label>
                    <Controller
                      name={`terpeneProfile.${index}.name`}
                      control={control}
                      defaultValue="" 
                      render={({ field: controllerField }) => (
                        <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a terpene" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorizedTerpenes.map(category => (
                              <SelectGroup key={category.label}>
                                <SelectLabel>{category.label}</SelectLabel>
                                {category.options.map(terpeneName => (
                                  <SelectItem key={terpeneName} value={terpeneName}>
                                    {terpeneName}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.terpeneProfile?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.terpeneProfile[index]?.name?.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`terpeneProfile.${index}.percentage`}>Percentage (%)</Label>
                    <Input type="number" step="0.01" {...register(`terpeneProfile.${index}.percentage`)} placeholder="e.g., 0.5" />
                    {errors.terpeneProfile?.[index]?.percentage && <p className="text-sm text-destructive mt-1">{errors.terpeneProfile[index]?.percentage?.message}</p>}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeTerpene(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendTerpene({ name: '', percentage: undefined, description: '' })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Terpene
            </Button>
            {terpeneProfileFields.length === 0 && <p className="text-sm text-muted-foreground">No terpenes added yet.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Clock size={24} className="mr-2" /> Cultivation Phases</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="cultivationPhases.germination">Germination Phase Duration</Label>
              <Input id="cultivationPhases.germination" {...register("cultivationPhases.germination")} placeholder="e.g., 3-7 days" />
              {errors.cultivationPhases?.germination && <p className="text-sm text-destructive mt-1">{errors.cultivationPhases.germination.message}</p>}
            </div>
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
                        <Label className="font-medium mb-1 block">Max Height (cm)</Label> 
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
                        <Label className="font-medium mb-1 block">Max Moisture (%)</Label> 
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
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><DollarSign size={24} className="mr-2" /> Pricing Information (per gram)</CardTitle>
                <CardDescription>Enter the estimated minimum, maximum, and average price per gram.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <Label htmlFor="pricing.min">Min Price ($)</Label>
                    <Input id="pricing.min" type="number" step="0.01" {...register("pricing.min")} placeholder="e.g., 8.00" />
                    {errors.pricing?.min && <p className="text-sm text-destructive mt-1">{errors.pricing.min.message}</p>}
                </div>
                <div>
                    <Label htmlFor="pricing.max">Max Price ($)</Label>
                    <Input id="pricing.max" type="number" step="0.01" {...register("pricing.max")} placeholder="e.g., 12.50" />
                    {errors.pricing?.max && <p className="text-sm text-destructive mt-1">{errors.pricing.max.message}</p>}
                </div>
                <div>
                    <Label htmlFor="pricing.avg">Average Price ($)</Label>
                    <Input id="pricing.avg" type="number" step="0.01" {...register("pricing.avg")} placeholder="e.g., 10.25" />
                    {errors.pricing?.avg && <p className="text-sm text-destructive mt-1">{errors.pricing.avg.message}</p>}
                </div>
                </div>
                 {errors.pricing?.message && <p className="text-sm text-destructive mt-1">{errors.pricing.message}</p>}
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
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_geneticCertificates.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_geneticCertificates.${index}.name`)} placeholder="Certificate Name" />
                                    {errors.additionalInfo_geneticCertificates?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_geneticCertificates?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_geneticCertificates.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_geneticCertificates.${index}.url`)} placeholder="https://example.com/cert.pdf" />
                                    {errors.additionalInfo_geneticCertificates?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_geneticCertificates?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeGeneticCertificate(index)}>
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
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_plantPictures.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_plantPictures.${index}.name`)} placeholder="Picture Name" />
                                    {errors.additionalInfo_plantPictures?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_plantPictures?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_plantPictures.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_plantPictures.${index}.url`)} placeholder="https://example.com/image.jpg" />
                                    {errors.additionalInfo_plantPictures?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_plantPictures?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <div className="mt-2">
                                <Label htmlFor={`additionalInfo_plantPictures.${index}.dataAiHint`}>Image AI Hint (keywords)</Label>
                                <Input {...register(`additionalInfo_plantPictures.${index}.dataAiHint`)} placeholder="e.g. cannabis bud, trichome macro" />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removePlantPicture(index)}>
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
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_cannabinoidInfos.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_cannabinoidInfos.${index}.name`)} placeholder="Cannabinoid Report Name" />
                                    {errors.additionalInfo_cannabinoidInfos?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_cannabinoidInfos?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_cannabinoidInfos.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_cannabinoidInfos.${index}.url`)} placeholder="https://example.com/cannabinoid.pdf" />
                                    {errors.additionalInfo_cannabinoidInfos?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_cannabinoidInfos?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeCannabinoidInfo(index)}>
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
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_terpeneInfos.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_terpeneInfos.${index}.name`)} placeholder="Terpene Report Name" />
                                    {errors.additionalInfo_terpeneInfos?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_terpeneInfos?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_terpeneInfos.${index}.url`}>File URL *</Label>
                                    <Input type="url" {...register(`additionalInfo_terpeneInfos.${index}.url`)} placeholder="https://example.com/terpene.pdf" />
                                    {errors.additionalInfo_terpeneInfos?.[index]?.url && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_terpeneInfos?.[index]?.url?.message}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeTerpeneInfo(index)}>
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
