
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { mockCultivars } from '@/lib/mock-data';
import type { Cultivar, Genetics, CannabinoidProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Leaf, Percent, Edit3, Clock, Hash, ImageIcon, FileText, Award, FlaskConical, Sprout, Combine, Droplets, BarChartBig, Paperclip, Info } from 'lucide-react';

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

  // Simplified images and additionalInfo for form
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
  
  additionalInfo_geneticCertificate_name: z.string().optional(),
  additionalInfo_geneticCertificate_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  additionalInfo_plantPicture_name: z.string().optional(),
  additionalInfo_plantPicture_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  additionalInfo_plantPicture_dataAiHint: z.string().optional(),
  additionalInfo_cannabinoidInfo_name: z.string().optional(),
  additionalInfo_cannabinoidInfo_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  additionalInfo_terpeneInfo_name: z.string().optional(),
  additionalInfo_terpeneInfo_url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
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
    },
  });

  const onSubmit = (data: CultivarFormData) => {
    setIsLoading(true);
    try {
      const newCultivarId = Date.now().toString() + Math.random().toString(36).substring(2,7);
      
      const newCultivar: Cultivar = {
        id: newCultivarId,
        name: data.name,
        genetics: data.genetics,
        thc: data.thc as CannabinoidProfile, // Cast because form schema allows undefined, but Cultivar type expects defined or fully absent obj
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
            yieldPerPlant: data.plantCharacteristics?.yieldPerPlant?.min !== undefined || data.plantCharacteristics?.yieldPerPlant?.max !== undefined ? data.plantCharacteristics.yieldPerPlant : undefined,
            yieldPerWatt: data.plantCharacteristics?.yieldPerWatt?.min !== undefined || data.plantCharacteristics?.yieldPerWatt?.max !== undefined ? data.plantCharacteristics.yieldPerWatt : undefined,
            yieldPerM2: data.plantCharacteristics?.yieldPerM2?.min !== undefined || data.plantCharacteristics?.yieldPerM2?.max !== undefined ? data.plantCharacteristics.yieldPerM2 : undefined,
        },
        additionalInfo: {},
      };

      if (data.additionalInfo_geneticCertificate_url && data.additionalInfo_geneticCertificate_name) {
        if(!newCultivar.additionalInfo) newCultivar.additionalInfo = {};
        newCultivar.additionalInfo.geneticCertificate = [{id: `addinf-gc-${newCultivarId}`, name: data.additionalInfo_geneticCertificate_name, url: data.additionalInfo_geneticCertificate_url, fileType: 'pdf', category: 'geneticCertificate'}];
      }
      if (data.additionalInfo_plantPicture_url && data.additionalInfo_plantPicture_name) {
        if(!newCultivar.additionalInfo) newCultivar.additionalInfo = {};
        newCultivar.additionalInfo.plantPicture = [{id: `addinf-pp-${newCultivarId}`, name: data.additionalInfo_plantPicture_name, url: data.additionalInfo_plantPicture_url, fileType: 'image', category: 'plantPicture', 'data-ai-hint': data.additionalInfo_plantPicture_dataAiHint}];
      }
      if (data.additionalInfo_cannabinoidInfo_url && data.additionalInfo_cannabinoidInfo_name) {
         if(!newCultivar.additionalInfo) newCultivar.additionalInfo = {};
        newCultivar.additionalInfo.cannabinoidInfo = [{id: `addinf-ci-${newCultivarId}`, name: data.additionalInfo_cannabinoidInfo_name, url: data.additionalInfo_cannabinoidInfo_url, fileType: 'pdf', category: 'cannabinoidInfo'}];
      }
      if (data.additionalInfo_terpeneInfo_url && data.additionalInfo_terpeneInfo_name) {
        if(!newCultivar.additionalInfo) newCultivar.additionalInfo = {};
        newCultivar.additionalInfo.terpeneInfo = [{id: `addinf-ti-${newCultivarId}`, name: data.additionalInfo_terpeneInfo_name, url: data.additionalInfo_terpeneInfo_url, fileType: 'pdf', category: 'terpeneInfo'}];
      }

      mockCultivars.unshift(newCultivar); // Add to the beginning of the array

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
  
  const renderMinMaxInput = (fieldPrefix: keyof CultivarFormData, label: string, subLabel?: string) => (
    <div className="grid grid-cols-2 gap-4 items-end">
      <div>
        <Label htmlFor={`${String(fieldPrefix)}.min`}>{label} Min {subLabel}</Label>
        <Input id={`${String(fieldPrefix)}.min`} type="number" step="0.1" {...register(`${String(fieldPrefix)}.min`)} placeholder="e.g., 18.0" />
        {errors[fieldPrefix]?.min && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix]?.min?.message}</p>}
         {/* @ts-ignore */}
        {errors[fieldPrefix]?.message && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix]?.message}</p>}
      </div>
      <div>
        <Label htmlFor={`${String(fieldPrefix)}.max`}>{label} Max {subLabel}</Label>
        <Input id={`${String(fieldPrefix)}.max`} type="number" step="0.1" {...register(`${String(fieldPrefix)}.max`)} placeholder="e.g., 22.5" />
        {errors[fieldPrefix]?.max && <p className="text-sm text-destructive mt-1">{errors[fieldPrefix]?.max?.message}</p>}
      </div>
    </div>
  );

  const renderFileInput = (categoryKey: string, icon: React.ReactNode, title: string, nameFieldName: keyof CultivarFormData, urlFieldName: keyof CultivarFormData, dataAiHintFieldName?: keyof CultivarFormData) => (
    <div>
      <h4 className="font-medium text-md flex items-center mb-2">{icon} {title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={String(nameFieldName)}>File Name</Label>
          <Input id={String(nameFieldName)} {...register(nameFieldName)} placeholder={`${title} Name`} />
           {/* @ts-ignore */}
          {errors[nameFieldName] && <p className="text-sm text-destructive mt-1">{errors[nameFieldName]?.message}</p>}
        </div>
        <div>
          <Label htmlFor={String(urlFieldName)}>File URL</Label>
          <Input id={String(urlFieldName)} type="url" {...register(urlFieldName)} placeholder="https://example.com/file.jpg" />
           {/* @ts-ignore */}
          {errors[urlFieldName] && <p className="text-sm text-destructive mt-1">{errors[urlFieldName]?.message}</p>}
        </div>
      </div>
      {dataAiHintFieldName && (
         <div className="mt-2">
            <Label htmlFor={String(dataAiHintFieldName)}>Image AI Hint (keywords)</Label>
            <Input id={String(dataAiHintFieldName)} {...register(dataAiHintFieldName)} placeholder="e.g. cannabis bud" />
             {/* @ts-ignore */}
            {errors[dataAiHintFieldName] && <p className="text-sm text-destructive mt-1">{errors[dataAiHintFieldName]?.message}</p>}
        </div>
      )}
    </div>
  );


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
            {/* Basic Info */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="font-medium mb-1 block">Plant Height (cm)</Label>
                        {renderMinMaxInput("plantCharacteristics.minHeight" as any, "Min Height", "")}
                        {/* @ts-ignore */}
                        {errors.plantCharacteristics?.minHeight?.message && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics?.minHeight?.message}</p>}
                    </div>
                     <div>
                        <Label className="font-medium mb-1 block">&nbsp;</Label> {/* Spacer for alignment */}
                        {renderMinMaxInput("plantCharacteristics.maxHeight" as any, "Max Height", "")}
                         {/* @ts-ignore */}
                        {errors.plantCharacteristics?.maxHeight?.message && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics?.maxHeight?.message}</p>}
                    </div>
                </div>
                 <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <Label className="font-medium mb-1 block">Dry Product Moisture (%)</Label>
                         {renderMinMaxInput("plantCharacteristics.minMoisture" as any, "Min Moisture", "")}
                          {/* @ts-ignore */}
                        {errors.plantCharacteristics?.minMoisture?.message && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics?.minMoisture?.message}</p>}
                    </div>
                     <div>
                        <Label className="font-medium mb-1 block">&nbsp;</Label> {/* Spacer for alignment */}
                         {renderMinMaxInput("plantCharacteristics.maxMoisture" as any, "Max Moisture", "")}
                          {/* @ts-ignore */}
                        {errors.plantCharacteristics?.maxMoisture?.message && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics?.maxMoisture?.message}</p>}
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
                <CardDescription>Provide URLs for relevant documents or images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderFileInput("geneticCertificate", <Award size={18} className="mr-2 text-accent"/>, "Genetic Certificate", "additionalInfo_geneticCertificate_name", "additionalInfo_geneticCertificate_url")}
                <Separator />
                {renderFileInput("plantPicture", <ImageIcon size={18} className="mr-2 text-accent"/>, "Plant Picture", "additionalInfo_plantPicture_name", "additionalInfo_plantPicture_url", "additionalInfo_plantPicture_dataAiHint")}
                <Separator />
                {renderFileInput("cannabinoidInfo", <FileText size={18} className="mr-2 text-accent"/>, "Cannabinoid Info", "additionalInfo_cannabinoidInfo_name", "additionalInfo_cannabinoidInfo_url")}
                <Separator />
                {renderFileInput("terpeneInfo", <FlaskConical size={18} className="mr-2 text-accent"/>, "Terpene Info", "additionalInfo_terpeneInfo_name", "additionalInfo_terpeneInfo_url")}
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
