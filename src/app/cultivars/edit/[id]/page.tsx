
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller, useFieldArray, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCultivarById, updateCultivar, uploadImage, deleteImageByUrl } from '@/services/firebase';
import { groupTerpenesByCategory, EFFECT_OPTIONS, MEDICAL_EFFECT_OPTIONS, FLAVOR_OPTIONS } from '@/lib/mock-data';
import type { Cultivar, Genetics, CannabinoidProfile, AdditionalFileInfo, AdditionalInfoCategoryKey, YieldProfile, Terpene, PricingProfile, CultivarImage, CultivarStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, Leaf, Percent, Edit3, Clock, ImageIcon, FileText, Award, FlaskConical, Sprout, Combine, Droplets, BarChartBig, Paperclip, Info, PlusCircle, Trash2, Palette, DollarSign, Sunrise, Smile, Stethoscope, ExternalLink, Users, Network, Loader2, Upload, AlertCircle, Database, CheckCheck, ShieldCheck, ArchiveIcon, Utensils } from 'lucide-react';
import EditCultivarLoading from './loading';
import NextImage from 'next/image';

const GENETIC_OPTIONS: Genetics[] = ['Sativa', 'Indica', 'Ruderalis', 'Hybrid'];
const STATUS_OPTIONS: CultivarStatus[] = ['recentlyAdded', 'verified', 'archived'];
const STATUS_LABELS: Record<CultivarStatus, string> = {
  recentlyAdded: 'Recently Added',
  verified: 'Verified',
  archived: 'Archived',
};

const numberRangeSchema = z.object({
  min: z.coerce.number().min(0, "Min must be >= 0").max(100, "Min must be <= 100").optional(),
  max: z.coerce.number().min(0, "Max must be >= 0").max(100, "Max must be <= 100").optional(),
}).refine(data => (data.min === undefined && data.max === undefined) || (data.min !== undefined && data.max !== undefined && data.min <= data.max) || (data.min !== undefined && data.max === undefined) || (data.min === undefined && data.max !== undefined), {
  message: "Min value must be less than or equal to Max value if both are provided",
  path: ["min"],
});


const yieldRangeSchema = z.object({
  min: z.coerce.number().min(0, "Min must be >= 0").optional(),
  max: z.coerce.number().min(0, "Max must be >= 0").optional(),
}).refine(data => (data.min === undefined && data.max === undefined) || (data.min !== undefined && data.max !== undefined && data.min <= data.max) || (data.min !== undefined && data.max === undefined) || (data.min === undefined && data.max !== undefined), {
  message: "Min value must be less than or equal to Max value if both are provided",
  path: ["min"],
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_DOC_TYPES = ["application/pdf"];

const filePreprocess = (arg: unknown) => {
  if (arg instanceof FileList && arg.length > 0) return arg[0];
  if (arg instanceof FileList && arg.length === 0) return undefined;
  return arg;
};

const optionalFileBaseSchema = z.preprocess(filePreprocess,
  z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .optional()
);

const imageFileInputSchema = optionalFileBaseSchema
  .refine(file => file === undefined || ACCEPTED_IMAGE_TYPES.includes(file.type),
    ".jpg, .jpeg, .png and .webp files are accepted."
  );

const pdfFileInputSchema = optionalFileBaseSchema
  .refine(file => file === undefined || ACCEPTED_DOC_TYPES.includes(file.type),
    ".pdf files are accepted."
  );


const additionalFileFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "File name is required."),
  url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  file: pdfFileInputSchema,
  category: z.custom<AdditionalInfoCategoryKey>()
});

const additionalImageFileFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "File name is required."),
  url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  file: imageFileInputSchema,
  dataAiHint: z.string().optional(),
  category: z.custom<AdditionalInfoCategoryKey>()
});

const terpeneEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Terpene name is required."),
  percentage: z.coerce.number().min(0, "Percentage must be >=0").max(100, "Percentage must be <=100").optional(),
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
    message: "Min price (€) must be less than or equal to Max price (€).",
    path: ["max"],
  }).optional();

const effectEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Effect name is required."),
});

const flavorEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Flavor name is required."),
});

const lineageEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
});

const cultivarFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  genetics: z.enum(GENETIC_OPTIONS).optional(),
  status: z.enum(STATUS_OPTIONS).optional(),
  source: z.string().optional(),
  description: z.string().optional(),

  supplierUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  parents: z.array(lineageEntrySchema).optional().default([]),
  children: z.array(lineageEntrySchema).optional().default([]),

  terpeneProfile: z.array(terpeneEntrySchema).optional(),

  effects: z.array(effectEntrySchema).optional().default([]),
  medicalEffects: z.array(effectEntrySchema).optional().default([]),
  flavors: z.array(flavorEntrySchema).optional().default([]),

  primaryImageFile: imageFileInputSchema,
  primaryImageAlt: z.string().optional(),
  primaryImageDataAiHint: z.string().optional(),
  existingPrimaryImageUrl: z.string().optional().or(z.literal('')), 
  existingPrimaryImageId: z.string().optional(),

  thc: numberRangeSchema.optional(),
  cbd: numberRangeSchema.optional(),
  cbc: numberRangeSchema.optional(),
  cbg: numberRangeSchema.optional(),
  cbn: numberRangeSchema.optional(),
  thcv: numberRangeSchema.optional(),

  cultivationPhases: z.object({
    germination: z.string().optional(),
    rooting: z.string().optional(),
    vegetative: z.string().optional(),
    flowering: z.string().optional(),
    harvest: z.string().optional(),
  }).optional(),

  plantCharacteristics: z.object({
    minHeight: z.coerce.number().min(0, "Min height must be >= 0").optional(),
    maxHeight: z.coerce.number().min(0, "Max height must be >= 0").optional(),
    minMoisture: z.coerce.number().min(0, "Min moisture must be >= 0").max(100, "Min moisture must be <= 100").optional(),
    maxMoisture: z.coerce.number().min(0, "Max moisture must be >= 0").max(100, "Max moisture must be <= 100").optional(),
    yieldPerPlant: yieldRangeSchema.optional(),
    yieldPerWatt: yieldRangeSchema.optional(),
    yieldPerM2: yieldRangeSchema.optional(),
  }).refine(data => (data.minHeight === undefined || data.maxHeight === undefined) || data.minHeight <= data.maxHeight, {
    message: "Min height must be less than or equal to Max height",
    path: ["maxHeight"],
  }).refine(data => (data.minMoisture === undefined || data.maxMoisture === undefined) || data.minMoisture <= data.maxMoisture, {
    message: "Min moisture must be less than or equal to Max moisture",
    path: ["maxMoisture"],
  }).optional(),

  pricing: pricingSchema,

  additionalInfo_geneticCertificates: z.array(additionalFileFormSchema).optional(),
  additionalInfo_plantPictures: z.array(additionalImageFileFormSchema).optional(),
  additionalInfo_cannabinoidInfos: z.array(additionalFileFormSchema).optional(),
  additionalInfo_terpeneInfos: z.array(additionalFileFormSchema).optional(),
});

type CultivarFormData = z.infer<typeof cultivarFormSchema>;

const defaultFormValues: CultivarFormData = {
  name: '',
  genetics: undefined, 
  status: undefined,
  source: '',
  description: '',
  supplierUrl: '',
  parents: [],
  children: [],
  terpeneProfile: [],
  effects: [],
  medicalEffects: [],
  flavors: [],
  primaryImageFile: undefined,
  primaryImageAlt: '',
  primaryImageDataAiHint: '',
  existingPrimaryImageUrl: '',
  existingPrimaryImageId: undefined,
  thc: { min: undefined, max: undefined }, 
  cbd: { min: undefined, max: undefined }, 
  cbc: { min: undefined, max: undefined },
  cbg: { min: undefined, max: undefined },
  cbn: { min: undefined, max: undefined },
  thcv: { min: undefined, max: undefined },
  cultivationPhases: { germination: '', rooting: '', vegetative: '', flowering: '', harvest: '' },
  plantCharacteristics: {
    minHeight: undefined, maxHeight: undefined,
    minMoisture: undefined, maxMoisture: undefined,
    yieldPerPlant: { min: undefined, max: undefined },
    yieldPerWatt: { min: undefined, max: undefined },
    yieldPerM2: { min: undefined, max: undefined },
  },
  pricing: { min: undefined, max: undefined, avg: undefined },
  additionalInfo_geneticCertificates: [],
  additionalInfo_plantPictures: [],
  additionalInfo_cannabinoidInfos: [],
  additionalInfo_terpeneInfos: [],
};


const categorizedTerpenes = groupTerpenesByCategory();

export default function EditCultivarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [initialCultivarData, setInitialCultivarData] = useState<Cultivar | null>(null);
  const [initialPrimaryImageUrl, setInitialPrimaryImageUrl] = useState<string | undefined>(undefined);


  const { control, handleSubmit, register, formState: { errors, isDirty, isValid }, reset, watch, setValue } = useForm<CultivarFormData>({
    resolver: zodResolver(cultivarFormSchema),
    mode: 'onChange',
    defaultValues: defaultFormValues,
  });

  const watchedPrimaryImageFile = watch("primaryImageFile");
  const watchedExistingPrimaryImageUrl = watch("existingPrimaryImageUrl");


  useEffect(() => {
    if (id) {
      const fetchCultivarData = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
          const cultivar = await getCultivarById(id);
          if (cultivar) {
            setInitialCultivarData(cultivar);
            const existingImageUrl = cultivar.images?.[0]?.url;
            setInitialPrimaryImageUrl(existingImageUrl);

            const formData: CultivarFormData = {
              name: cultivar.name,
              genetics: cultivar.genetics,
              status: cultivar.status || undefined,
              source: cultivar.source || '',
              description: cultivar.description || '',
              supplierUrl: cultivar.supplierUrl || '',
              parents: cultivar.parents?.map(p => ({ name: p, id: `parent-${Math.random()}` })) || [],
              children: cultivar.children?.map(c => ({ name: c, id: `child-${Math.random()}` })) || [],
              terpeneProfile: cultivar.terpeneProfile?.map(tp => ({ id: tp.id, name: tp.name, percentage: tp.percentage })) || [],
              effects: cultivar.effects?.map(e => ({ name: e, id: `effect-${Math.random()}` })) || [],
              medicalEffects: cultivar.medicalEffects?.map(me => ({ name: me, id: `medeffect-${Math.random()}` })) || [],
              flavors: cultivar.flavors?.map(f => ({ name: f, id: `flavor-${Math.random()}` })) || [],
              
              primaryImageFile: undefined, 
              existingPrimaryImageUrl: existingImageUrl || '',
              existingPrimaryImageId: cultivar.images?.[0]?.id || undefined,
              primaryImageAlt: cultivar.images?.[0]?.alt || '',
              primaryImageDataAiHint: cultivar.images?.[0]?.['data-ai-hint'] || '',

              thc: cultivar.thc || { min: undefined, max: undefined }, 
              cbd: cultivar.cbd || { min: undefined, max: undefined }, 
              cbc: cultivar.cbc || { min: undefined, max: undefined },
              cbg: cultivar.cbg || { min: undefined, max: undefined },
              cbn: cultivar.cbn || { min: undefined, max: undefined },
              thcv: cultivar.thcv || { min: undefined, max: undefined },
              cultivationPhases: cultivar.cultivationPhases || { germination: '', rooting: '', vegetative: '', flowering: '', harvest: '' },
              plantCharacteristics: cultivar.plantCharacteristics || {
                minHeight: undefined, maxHeight: undefined,
                minMoisture: undefined, maxMoisture: undefined,
                yieldPerPlant: { min: undefined, max: undefined },
                yieldPerWatt: { min: undefined, max: undefined },
                yieldPerM2: { min: undefined, max: undefined },
              },
              pricing: cultivar.pricing || { min: undefined, max: undefined, avg: undefined },
              additionalInfo_geneticCertificates: cultivar.additionalInfo?.geneticCertificate?.map(f => ({...f, file: undefined as File | undefined, url: f.url || undefined })) || [],
              additionalInfo_plantPictures: cultivar.additionalInfo?.plantPicture?.map(f => ({...f, file: undefined as File | undefined, url: f.url || undefined, dataAiHint: f['data-ai-hint'] || undefined })) || [],
              additionalInfo_cannabinoidInfos: cultivar.additionalInfo?.cannabinoidInfo?.map(f => ({...f, file: undefined as File | undefined, url: f.url || undefined })) || [],
              additionalInfo_terpeneInfos: cultivar.additionalInfo?.terpeneInfo?.map(f => ({...f, file: undefined as File | undefined, url: f.url || undefined })) || [],
            };
            reset(formData);
          } else {
            setFetchError("Cultivar not found.");
          }
        } catch (err) {
          console.error("Failed to fetch cultivar:", err);
          setFetchError("Failed to load cultivar data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCultivarData();
    }
  }, [id, reset]);

  const handleRemovePrimaryImage = () => {
    setValue('existingPrimaryImageUrl', '');
    setValue('existingPrimaryImageId', undefined);
    setValue('primaryImageFile', undefined);
  };

  const { fields: terpeneProfileFields, append: appendTerpene, remove: removeTerpene } = useFieldArray({ control, name: "terpeneProfile" });
  const { fields: effectFields, append: appendEffect, remove: removeEffect } = useFieldArray({ control, name: "effects" });
  const { fields: medicalEffectFields, append: appendMedicalEffect, remove: removeMedicalEffect } = useFieldArray({ control, name: "medicalEffects" });
  const { fields: flavorFields, append: appendFlavor, remove: removeFlavor } = useFieldArray({ control, name: "flavors" });
  const { fields: parentFields, append: appendParent, remove: removeParent } = useFieldArray({ control, name: "parents" });
  const { fields: childrenFields, append: appendChild, remove: removeChild } = useFieldArray({ control, name: "children" });
  const { fields: geneticCertificateFields, append: appendGeneticCertificate, remove: removeGeneticCertificate } = useFieldArray({ control, name: "additionalInfo_geneticCertificates" });
  const { fields: plantPictureFields, append: appendPlantPicture, remove: removePlantPicture } = useFieldArray({ control, name: "additionalInfo_plantPictures" });
  const { fields: cannabinoidInfoFields, append: appendCannabinoidInfo, remove: removeCannabinoidInfo } = useFieldArray({ control, name: "additionalInfo_cannabinoidInfos" });
  const { fields: terpeneInfoFields, append: appendTerpeneInfo, remove: removeTerpeneInfo } = useFieldArray({ control, name: "additionalInfo_terpeneInfos" });


  const onSubmit = async (data: CultivarFormData) => {
    if (!initialCultivarData) {
        toast({ title: "Error", description: "Initial cultivar data not loaded.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      let finalPrimaryImage: CultivarImage | undefined = undefined;
      const oldImageUrlFromLoad = initialPrimaryImageUrl;

      if (data.primaryImageFile instanceof File) {
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${data.primaryImageFile.name}`;
        const newUrl = await uploadImage(data.primaryImageFile, `cultivar-images/${uniqueFileName}`);
        finalPrimaryImage = {
            id: data.existingPrimaryImageId || `img-${Date.now()}-main`,
            url: newUrl,
            alt: data.primaryImageAlt || `${data.name} primary image`,
            'data-ai-hint': data.primaryImageDataAiHint
        };
        if (oldImageUrlFromLoad && oldImageUrlFromLoad !== newUrl) {
          try {
            await deleteImageByUrl(oldImageUrlFromLoad);
          } catch (delError) {
            console.warn("Failed to delete old primary image from storage, it might have already been deleted:", delError);
          }
        }
      } else if (data.existingPrimaryImageUrl) {
         finalPrimaryImage = {
            id: data.existingPrimaryImageId!,
            url: data.existingPrimaryImageUrl,
            alt: data.primaryImageAlt || `${data.name} primary image`,
            'data-ai-hint': data.primaryImageDataAiHint
        };
      } else { 
        finalPrimaryImage = undefined;
        if (oldImageUrlFromLoad) {
           try {
            await deleteImageByUrl(oldImageUrlFromLoad);
          } catch (delError) {
            console.warn("Failed to delete old primary image from storage after removal from form:", delError);
          }
        }
      }


      const processAdditionalFiles = async (
        formFiles: (typeof data.additionalInfo_plantPictures | typeof data.additionalInfo_geneticCertificates),
        storagePath: string,
        category: AdditionalInfoCategoryKey,
        fileType: 'image' | 'pdf'
      ): Promise<AdditionalFileInfo[]> => {
        if (!formFiles) return [];
        const processedFiles: AdditionalFileInfo[] = [];
        for (const formFile of formFiles) {
          let url = formFile.url;
          if (formFile.file instanceof File) {
            const timestamp = Date.now();
            const uniqueFileName = `${timestamp}-${formFile.file.name}`;
            url = await uploadImage(formFile.file, `${storagePath}/${uniqueFileName}`);
            // TODO: Deletion of old file if formFile.url existed and is different from new url
          }
          if (url) {
            processedFiles.push({
              id: formFile.id || `${category.substring(0,3)}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              name: formFile.name,
              url: url,
              fileType: fileType,
              category: category,
              'data-ai-hint': (formFile as typeof data.additionalInfo_plantPictures[0])?.dataAiHint,
            });
          }
        }
        return processedFiles;
      };
      
      const updatedPlantPictures = await processAdditionalFiles(data.additionalInfo_plantPictures, 'cultivar-images/additional', 'plantPicture', 'image');
      const updatedGeneticCertificates = await processAdditionalFiles(data.additionalInfo_geneticCertificates, 'cultivar-docs/certificates', 'geneticCertificate', 'pdf');
      const updatedCannabinoidInfos = await processAdditionalFiles(data.additionalInfo_cannabinoidInfos, 'cultivar-docs/cannabinoid-info', 'cannabinoidInfo', 'pdf');
      const updatedTerpeneInfos = await processAdditionalFiles(data.additionalInfo_terpeneInfos, 'cultivar-docs/terpene-info', 'terpeneInfo', 'pdf');


      const cultivarDataForFirebase: Partial<Cultivar> = {
        name: data.name,
        genetics: data.genetics,
        status: data.status,
        source: data.source || undefined,
        description: data.description || undefined,
        supplierUrl: data.supplierUrl || undefined,
        parents: data.parents ? data.parents.map(p => p.name).filter(name => name) : [],
        children: data.children ? data.children.map(c => c.name).filter(name => name) : [],
        terpeneProfile: data.terpeneProfile?.map((tp, index) => ({
            id: tp.id || `terp-${Date.now()}-${index}`,
            name: tp.name,
            percentage: tp.percentage,
        })) || [],
        effects: data.effects ? data.effects.map(e => e.name).filter(e => e) : [],
        medicalEffects: data.medicalEffects ? data.medicalEffects.map(e => e.name).filter(e => e) : [],
        flavors: data.flavors ? data.flavors.map(f => f.name).filter(f => f) : [],
        images: finalPrimaryImage ? [finalPrimaryImage] : [],
        thc: data.thc,
        cbd: data.cbd,
        cbc: data.cbc,
        cbg: data.cbg,
        cbn: data.cbn,
        thcv: data.thcv,
        cultivationPhases: data.cultivationPhases,
        plantCharacteristics: data.plantCharacteristics,
        pricing: data.pricing,
        additionalInfo: {
          geneticCertificate: updatedGeneticCertificates,
          plantPicture: updatedPlantPictures,
          cannabinoidInfo: updatedCannabinoidInfos,
          terpeneInfo: updatedTerpeneInfos,
        },
      };

      await updateCultivar(id, cultivarDataForFirebase);

      toast({
        title: "Cultivar Updated!",
        description: `${data.name} has been successfully updated.`,
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
      router.push(`/cultivars/${id}`);
    } catch (error) {
      console.error("Failed to update cultivar:", error);
      toast({
        title: "Update Error",
        description: (error as Error).message || "Failed to update cultivar. Please check the console and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMinMaxInput = (fieldPrefixKey: keyof CultivarFormData | `plantCharacteristics.${keyof NonNullable<CultivarFormData['plantCharacteristics']>}` | `pricing`, label: string, subLabel?: string) => {
    const fieldPrefix = String(fieldPrefixKey);

    const errorsAny = errors as any; 
    let minErrorMsg, maxErrorMsg, rootErrorMsg;

    if (fieldPrefix.includes('.')) {
        const [baseKey, nestedKey] = fieldPrefix.split('.') as [keyof CultivarFormData, string];
        if (errorsAny[baseKey] && errorsAny[baseKey][nestedKey]) {
            minErrorMsg = errorsAny[baseKey][nestedKey]?.min?.message;
            maxErrorMsg = errorsAny[baseKey][nestedKey]?.max?.message;
            rootErrorMsg = errorsAny[baseKey][nestedKey]?.message; 
        }
    } else {
        if (errorsAny[fieldPrefix]) {
            minErrorMsg = errorsAny[fieldPrefix]?.min?.message;
            maxErrorMsg = errorsAny[fieldPrefix]?.max?.message;
            rootErrorMsg = errorsAny[fieldPrefix]?.message; 
        }
    }
    
    const minField = `${fieldPrefix}.min` as any;
    const maxField = `${fieldPrefix}.max` as any;

    return (
        <div className="grid grid-cols-2 gap-4 items-start">
            <div>
                <Label htmlFor={minField}>{label} Min {subLabel}</Label>
                <Input id={minField} type="number" step="0.01" {...register(minField)} placeholder="e.g., 18.0" />
                {minErrorMsg && <p className="text-sm text-destructive mt-1">{minErrorMsg}</p>}
                {rootErrorMsg && !minErrorMsg && !maxErrorMsg && <p className="text-sm text-destructive mt-1">{rootErrorMsg}</p>}
            </div>
            <div>
                <Label htmlFor={maxField}>{label} Max {subLabel}</Label>
                <Input id={maxField} type="number" step="0.01" {...register(maxField)} placeholder="e.g., 22.5" />
                {maxErrorMsg && <p className="text-sm text-destructive mt-1">{maxErrorMsg}</p>}
            </div>
        </div>
    );
};

  if (isLoading) {
    return <EditCultivarLoading />;
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <AlertCircle size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-headline text-destructive mb-2">{fetchError}</h1>
        <Link href="/">
          <Button variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Browser
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 animate-fadeIn">
      <Link href={`/cultivars/${id}`} className="inline-flex items-center text-primary hover:underline mb-6 font-medium">
        <ArrowLeft size={20} className="mr-1" />
        Back to Cultivar Details
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary flex items-center"><Edit3 size={30} className="mr-3" /> Edit Cultivar: {initialCultivarData?.name}</CardTitle>
            <CardDescription>Modify the details for this cultivar. Fields marked with * are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Cultivar Name *</Label>
              <Input id="name" {...register("name")} placeholder="e.g., GreenLeaf Serenity" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Genetics</Label>
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
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>
                            {STATUS_LABELS[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
              </div>
            </div>


            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Describe the cultivar..." rows={4} />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            <div>
                <Label htmlFor="supplierUrl">Supplier URL</Label>
                <Input id="supplierUrl" type="url" {...register("supplierUrl")} placeholder="https://example-supplier.com/cultivar-link" />
                {errors.supplierUrl && <p className="text-sm text-destructive mt-1">{errors.supplierUrl.message}</p>}
            </div>
             <div>
              <Label htmlFor="source">Source of Data (Optional)</Label>
              <Input id="source" {...register("source")} placeholder="e.g., Lab Test ID, Community Submission" />
              {errors.source && <p className="text-sm text-destructive mt-1">{errors.source.message}</p>}
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
            <Button type="button" variant="outline" size="sm" onClick={() => appendTerpene({ name: '', percentage: undefined })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Terpene
            </Button>
            {terpeneProfileFields.length === 0 && <p className="text-sm text-muted-foreground">No terpenes added yet.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><Utensils size={24} className="mr-2" /> Reported Flavors</CardTitle>
                <CardDescription>Select the common flavors associated with this cultivar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {flavorFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md relative bg-muted/30 shadow-sm">
                        <div className="flex-grow">
                            <Label htmlFor={`flavors.${index}.name`}>Flavor *</Label>
                            <Controller
                                name={`flavors.${index}.name`}
                                control={control}
                                render={({ field: controllerField }) => (
                                    <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a flavor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FLAVOR_OPTIONS.map(flavorName => (
                                                <SelectItem key={flavorName} value={flavorName}>
                                                    {flavorName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.flavors?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.flavors?.[index]?.name?.message}</p>}
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeFlavor(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendFlavor({ name: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Flavor
                </Button>
                {flavorFields.length === 0 && <p className="text-sm text-muted-foreground">No flavors added yet.</p>}
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><ImageIcon size={24} className="mr-2" /> Primary Image</CardTitle>
                <CardDescription>Upload the main image for this cultivar. Uploading a new image will replace the existing one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {watchedPrimaryImageFile instanceof File ? (
                    <div className="mb-4">
                        <Label>New Primary Image Preview:</Label>
                        <div className="relative w-48 h-36 mt-1">
                           <NextImage src={URL.createObjectURL(watchedPrimaryImageFile)} alt="New primary image preview" layout="fill" objectFit="cover" className="rounded-md border" />
                        </div>
                    </div>
                ) : watchedExistingPrimaryImageUrl ? (
                    <div className="mb-4 space-y-2">
                        <Label>Current Primary Image:</Label>
                        <div className="relative w-48 h-36">
                             <NextImage src={watchedExistingPrimaryImageUrl} alt={watch('primaryImageAlt') || "Current primary image"} layout="fill" objectFit="cover" className="rounded-md border" />
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleRemovePrimaryImage} className="text-destructive border-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Current Image
                        </Button>
                    </div>
                ) :  <p className="text-sm text-muted-foreground">No primary image set.</p>}

                <div>
                    <Label htmlFor="primaryImageFile">New Primary Image File (replaces current if chosen)</Label>
                    <Input id="primaryImageFile" type="file" accept="image/*" {...register("primaryImageFile")} />
                    {errors.primaryImageFile && <p className="text-sm text-destructive mt-1">{errors.primaryImageFile.message as string}</p>}
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
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Percent size={24} className="mr-2" /> Cannabinoid Profile</CardTitle>
            <CardDescription>Enter the min/max percentages for THC and CBD. Other cannabinoids are optional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderMinMaxInput("thc", "THC", "(%)")}
            {renderMinMaxInput("cbd", "CBD", "(%)")}
            {renderMinMaxInput("cbc", "CBC", "(%)")}
            {renderMinMaxInput("cbg", "CBG", "(%)")}
            {renderMinMaxInput("cbn", "CBN", "(%)")}
            {renderMinMaxInput("thcv", "THCV", "(%)")}
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
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Clock size={24} className="mr-2" /> Cultivation Phases</CardTitle>
            <CardDescription>Provide estimated durations for each cultivation phase.</CardDescription>
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
                <CardDescription>Detail the physical traits and yield expectations of the cultivar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="font-medium mb-2 block">Plant Height (cm)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div>
                            <Label htmlFor="plantCharacteristics.minHeight">Min Height</Label>
                            <Input id="plantCharacteristics.minHeight" type="number" step="0.1" {...register("plantCharacteristics.minHeight")} placeholder="e.g., 60" />
                            {errors.plantCharacteristics?.minHeight && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics.minHeight.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="plantCharacteristics.maxHeight">Max Height</Label>
                            <Input id="plantCharacteristics.maxHeight" type="number" step="0.1" {...register("plantCharacteristics.maxHeight")} placeholder="e.g., 120" />
                             {errors.plantCharacteristics?.maxHeight && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics.maxHeight.message}</p>}
                        </div>
                    </div>
                </div>
                <Separator />
                <div>
                    <Label className="font-medium mb-2 block">Dry Product Moisture (%)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div>
                            <Label htmlFor="plantCharacteristics.minMoisture">Min Moisture</Label>
                            <Input id="plantCharacteristics.minMoisture" type="number" step="0.1" {...register("plantCharacteristics.minMoisture")} placeholder="e.g., 9" />
                            {errors.plantCharacteristics?.minMoisture && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics.minMoisture.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="plantCharacteristics.maxMoisture">Max Moisture</Label>
                            <Input id="plantCharacteristics.maxMoisture" type="number" step="0.1" {...register("plantCharacteristics.maxMoisture")} placeholder="e.g., 12" />
                             {errors.plantCharacteristics?.maxMoisture && <p className="text-sm text-destructive mt-1">{errors.plantCharacteristics.maxMoisture.message}</p>}
                        </div>
                    </div>
                </div>
                <Separator />
                <div>
                    <Label className="font-medium mb-2 block">Estimated Yield</Label>
                    <div className="space-y-4">
                        {renderMinMaxInput("plantCharacteristics.yieldPerPlant", "Yield/Plant", "(g)")}
                        {renderMinMaxInput("plantCharacteristics.yieldPerWatt", "Yield/Watt", "(g/W)")}
                        {renderMinMaxInput("plantCharacteristics.yieldPerM2", "Yield/m²", "(g/m²)")}
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><DollarSign size={24} className="mr-2" /> Pricing Information (per gram)</CardTitle>
                <CardDescription>Enter the estimated minimum, maximum, and average price per gram (€).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <Label htmlFor="pricing.min">Min Price (€)</Label>
                    <Input id="pricing.min" type="number" step="0.01" {...register("pricing.min")} placeholder="e.g., 7.50" />
                    {errors.pricing?.min && <p className="text-sm text-destructive mt-1">{errors.pricing.min.message}</p>}
                </div>
                <div>
                    <Label htmlFor="pricing.max">Max Price (€)</Label>
                    <Input id="pricing.max" type="number" step="0.01" {...register("pricing.max")} placeholder="e.g., 11.50" />
                    {errors.pricing?.max && <p className="text-sm text-destructive mt-1">{errors.pricing.max.message}</p>}
                     {errors.pricing && !errors.pricing.min && !errors.pricing.max && !errors.pricing.avg && errors.pricing.message && (
                        <p className="text-sm text-destructive mt-1">{errors.pricing.message}</p>
                    )}
                </div>
                <div>
                    <Label htmlFor="pricing.avg">Average Price (€)</Label>
                    <Input id="pricing.avg" type="number" step="0.01" {...register("pricing.avg")} placeholder="e.g., 9.75" />
                    {errors.pricing?.avg && <p className="text-sm text-destructive mt-1">{errors.pricing.avg.message}</p>}
                </div>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Users size={24} className="mr-2" /> Lineage: Parents</CardTitle>
            <CardDescription>List the parent cultivars.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parentFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md relative bg-muted/30 shadow-sm">
                <div className="flex-grow">
                  <Label htmlFor={`parents.${index}.name`}>Parent Name *</Label>
                  <Input {...register(`parents.${index}.name`)} placeholder="e.g., OG Kush" />
                  {errors.parents?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.parents[index]?.name?.message}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeParent(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendParent({ name: '' })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Parent
            </Button>
            {parentFields.length === 0 && <p className="text-sm text-muted-foreground">No parents added yet.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center"><Users size={24} className="mr-2" /> Lineage: Children</CardTitle>
            <CardDescription>List the child cultivars (if any).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {childrenFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md relative bg-muted/30 shadow-sm">
                <div className="flex-grow">
                  <Label htmlFor={`children.${index}.name`}>Child Name *</Label>
                  <Input {...register(`children.${index}.name`)} placeholder="e.g., Serene Dream" />
                  {errors.children?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.children[index]?.name?.message}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeChild(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendChild({ name: '' })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Child
            </Button>
            {childrenFields.length === 0 && <p className="text-sm text-muted-foreground">No children added yet.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center"><Paperclip size={28} className="mr-3"/> Additional Information</CardTitle>
                <CardDescription>Upload relevant documents or images. Add multiple files if needed. Uploading a new file will replace an existing one if names match, or add as new.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><Award size={18} className="mr-2 text-accent"/>Genetic Certificates (PDF)</h4 >
                        <Button type="button" variant="outline" size="sm" onClick={() => appendGeneticCertificate({ name: '', file: undefined, category: 'geneticCertificate', url: undefined })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Certificate
                        </Button>
                    </div>
                    {geneticCertificateFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                            {field.url && !watch(`additionalInfo_geneticCertificates.${index}.file`) && <p className="text-xs text-muted-foreground">Current file: <a href={field.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{field.name}</a></p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_geneticCertificates.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_geneticCertificates.${index}.name`)} placeholder="Certificate Name" />
                                    {errors.additionalInfo_geneticCertificates?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_geneticCertificates?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_geneticCertificates.${index}.file`}>New File Upload (PDF)</Label>
                                    <Input type="file" accept=".pdf" {...register(`additionalInfo_geneticCertificates.${index}.file`)} />
                                    {errors.additionalInfo_geneticCertificates?.[index]?.file && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_geneticCertificates?.[index]?.file?.message as string}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeGeneticCertificate(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     {geneticCertificateFields.length === 0 && <p className="text-sm text-muted-foreground">No genetic certificates added.</p>}
                </div>
                <Separator />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><ImageIcon size={18} className="mr-2 text-accent"/>Plant Pictures (Image)</h4 >
                        <Button type="button" variant="outline" size="sm" onClick={() => appendPlantPicture({ name: '', file: undefined, dataAiHint: '', category: 'plantPicture', url: undefined })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Picture
                        </Button>
                    </div>
                    {plantPictureFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                             {watch(`additionalInfo_plantPictures.${index}.file`) instanceof File ? (
                                 <div className="mb-2">
                                    <p className="text-xs text-muted-foreground">New Preview:</p>
                                    <NextImage src={URL.createObjectURL(watch(`additionalInfo_plantPictures.${index}.file`)!)} alt="New plant picture preview" width={100} height={75} className="rounded-md border object-cover mt-1"/>
                                </div>
                            ) : field.url ? (
                                <div className="mb-2">
                                    <p className="text-xs text-muted-foreground">Current: <a href={field.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{field.name}</a></p>
                                    <NextImage src={field.url} alt={field.name || "Plant picture"} width={100} height={75} className="rounded-md border object-cover mt-1"/>
                                </div>
                            ): null}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_plantPictures.${index}.name`}>Picture Name *</Label>
                                    <Input {...register(`additionalInfo_plantPictures.${index}.name`)} placeholder="Picture Name" />
                                    {errors.additionalInfo_plantPictures?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_plantPictures?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_plantPictures.${index}.file`}>New File Upload (Image)</Label>
                                    <Input type="file" accept="image/*" {...register(`additionalInfo_plantPictures.${index}.file`)} />
                                     {errors.additionalInfo_plantPictures?.[index]?.file && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_plantPictures?.[index]?.file?.message as string}</p>}
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
                    {plantPictureFields.length === 0 && <p className="text-sm text-muted-foreground">No plant pictures added.</p>}
                </div>
                <Separator />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><FileText size={18} className="mr-2 text-accent"/>Cannabinoid Information (PDF)</h4 >
                        <Button type="button" variant="outline" size="sm" onClick={() => appendCannabinoidInfo({ name: '', file: undefined, category: 'cannabinoidInfo', url: undefined })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Cannabinoid Info
                        </Button>
                    </div>
                    {cannabinoidInfoFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                            {field.url && !watch(`additionalInfo_cannabinoidInfos.${index}.file`) && <p className="text-xs text-muted-foreground">Current file: <a href={field.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{field.name}</a></p>}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_cannabinoidInfos.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_cannabinoidInfos.${index}.name`)} placeholder="Cannabinoid Report Name" />
                                    {errors.additionalInfo_cannabinoidInfos?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_cannabinoidInfos?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_cannabinoidInfos.${index}.file`}>New File Upload (PDF)</Label>
                                    <Input type="file" accept=".pdf" {...register(`additionalInfo_cannabinoidInfos.${index}.file`)} />
                                    {errors.additionalInfo_cannabinoidInfos?.[index]?.file && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_cannabinoidInfos?.[index]?.file?.message as string}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeCannabinoidInfo(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {cannabinoidInfoFields.length === 0 && <p className="text-sm text-muted-foreground">No cannabinoid information added.</p>}
                </div>
                <Separator />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-md flex items-center"><FlaskConical size={18} className="mr-2 text-accent"/>Terpene Information (PDF)</h4 >
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTerpeneInfo({ name: '', file: undefined, category: 'terpeneInfo', url: undefined })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Terpene Info
                        </Button>
                    </div>
                    {terpeneInfoFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 p-3 mb-2 border rounded-md relative bg-muted/30 shadow-sm">
                            {field.url && !watch(`additionalInfo_terpeneInfos.${index}.file`) && <p className="text-xs text-muted-foreground">Current file: <a href={field.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{field.name}</a></p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`additionalInfo_terpeneInfos.${index}.name`}>File Name *</Label>
                                    <Input {...register(`additionalInfo_terpeneInfos.${index}.name`)} placeholder="Terpene Report Name" />
                                    {errors.additionalInfo_terpeneInfos?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_terpeneInfos?.[index]?.name?.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor={`additionalInfo_terpeneInfos.${index}.file`}>New File Upload (PDF)</Label>
                                    <Input type="file" accept=".pdf" {...register(`additionalInfo_terpeneInfos.${index}.file`)} />
                                    {errors.additionalInfo_terpeneInfos?.[index]?.file && <p className="text-sm text-destructive mt-1">{errors.additionalInfo_terpeneInfos?.[index]?.file?.message as string}</p>}
                                </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeTerpeneInfo(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {terpeneInfoFields.length === 0 && <p className="text-sm text-muted-foreground">No terpene information added.</p>}
                </div>
            </CardContent>
        </Card>


        <CardFooter className="pt-6 border-t">
          <Button type="submit" className="w-full md:w-auto" size="lg" disabled={isSubmitting || !isDirty || !isValid}>
            {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>) : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}
