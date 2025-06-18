
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, PlusCircle, Upload, Leaf, Percent, Smile, Utensils, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addCultivar, uploadImage } from '@/services/firebase';
import type { Genetics, CannabinoidProfile, CultivarStatus } from '@/types';
import NextImage from 'next/image';

const GENETIC_OPTIONS_MODAL: Genetics[] = ['Sativa', 'Indica', 'Hybrid', 'Ruderalis'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const filePreprocess = (arg: unknown) => {
  if (arg instanceof FileList && arg.length > 0) return arg[0];
  if (arg instanceof FileList && arg.length === 0) return undefined;
  return arg;
};

const optionalImageFileInputSchema = z.preprocess(filePreprocess,
  z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), ".jpg, .jpeg, .png and .webp files are accepted.")
    .optional()
);

const numberRangeSchemaOptional = z.object({
  min: z.coerce.number().min(0, "Min must be >= 0").max(100, "Min must be <= 100").optional(),
  max: z.coerce.number().min(0, "Max must be >= 0").max(100, "Max must be <= 100").optional(),
}).refine(data => (data.min === undefined && data.max === undefined) || (data.min !== undefined && data.max !== undefined && data.min <= data.max) || (data.min !== undefined && data.max === undefined) || (data.min === undefined && data.max !== undefined), {
  message: "Min value must be less than or equal to Max value if both are provided",
  path: ["min"],
}).optional();

const submitCultivarFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  genetics: z.enum(GENETIC_OPTIONS_MODAL).optional(),
  description: z.string().optional(),
  effects: z.string().optional(), // Comma-separated
  flavors: z.string().optional(), // Comma-separated
  primaryImageFile: optionalImageFileInputSchema,
  primaryImageAlt: z.string().optional(),
  thc: numberRangeSchemaOptional,
  cbd: numberRangeSchemaOptional,
});

type SubmitCultivarFormData = z.infer<typeof submitCultivarFormSchema>;

interface SubmitCultivarModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function SubmitCultivarModal({ isOpen, onOpenChange }: SubmitCultivarModalProps) {
  const { user } = useAuth(); // Though modal is for non-logged in, good to have context
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SubmitCultivarFormData>({
    resolver: zodResolver(submitCultivarFormSchema),
    defaultValues: {
      name: '',
      genetics: undefined,
      description: '',
      effects: '',
      flavors: '',
      primaryImageFile: undefined,
      primaryImageAlt: '',
      thc: { min: undefined, max: undefined },
      cbd: { min: undefined, max: undefined },
    }
  });

  const watchedPrimaryImageFile = watch("primaryImageFile");

  const handleCultivarSubmit = async (data: SubmitCultivarFormData) => {
    setIsSubmitting(true);
    try {
      let primaryImageUrlForFirebase: string | undefined = undefined;
      if (data.primaryImageFile instanceof File) {
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${data.primaryImageFile.name}`;
        primaryImageUrlForFirebase = await uploadImage(data.primaryImageFile, `cultivar-images/user-submitted/${uniqueFileName}`);
      }

      const effectsArray = data.effects ? data.effects.split(',').map(e => e.trim()).filter(e => e) : [];
      const flavorsArray = data.flavors ? data.flavors.split(',').map(f => f.trim()).filter(f => f) : [];

      const cultivarDataForFirebase = {
        name: data.name,
        genetics: data.genetics as Genetics, // Will be undefined if not selected, which is fine
        description: data.description || '',
        effects: effectsArray,
        flavors: flavorsArray,
        images: primaryImageUrlForFirebase ? [{
            id: `img-user-${Date.now()}`,
            url: primaryImageUrlForFirebase,
            alt: data.primaryImageAlt || `${data.name} - user submitted`,
            'data-ai-hint': 'cannabis bud' // Generic hint for user uploads
        }] : [],
        thc: data.thc as CannabinoidProfile | undefined,
        cbd: data.cbd as CannabinoidProfile | undefined,
        // Explicitly set status and source
        status: 'User Submitted' as CultivarStatus,
        source: 'User Modal Submission',
        // Fill in other required fields with defaults if addCultivar expects them
        // or ensure addCultivar handles their absence.
        // For simplicity, we'll let addCultivar handle defaults for non-provided optional fields.
        // Essential fields like reviews, history, createdAt, updatedAt are handled by addCultivar.
      };

      // @ts-ignore - addCultivar expects more fields than this simplified form provides,
      // but it's designed to fill them with defaults. This cast silences TS for this specific case.
      await addCultivar(cultivarDataForFirebase as any);

      toast({
        title: "Cultivar Submitted!",
        description: `${data.name} has been submitted for review. Thank you!`,
        variant: "default",
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit cultivar:", error);
      toast({
        title: "Submission Error",
        description: (error as Error).message || "Failed to submit cultivar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting) {
        onOpenChange(open);
        if (!open) reset();
      }
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center text-2xl">
            <PlusCircle className="mr-2 h-6 w-6" /> Submit a Cultivar
          </DialogTitle>
          <DialogDescription>
            Help grow our database! Fill in the details below. All submissions will be reviewed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCultivarSubmit)} className="flex-grow overflow-y-auto px-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Cultivar Name *</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Community Haze" disabled={isSubmitting} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Genetics (Optional)</Label>
            <Controller
              name="genetics"
              control={control}
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 mt-1" disabled={isSubmitting}>
                  {GENETIC_OPTIONS_MODAL.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`genetics-modal-${option}`} />
                      <Label htmlFor={`genetics-modal-${option}`} className="font-normal">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...register('description')} placeholder="Briefly describe the cultivar..." rows={3} disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="effects">Effects (Optional, comma-separated)</Label>
            <Input id="effects" {...register('effects')} placeholder="e.g., Relaxed, Happy, Uplifted" disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flavors">Flavors (Optional, comma-separated)</Label>
            <Input id="flavors" {...register('flavors')} placeholder="e.g., Earthy, Sweet, Citrus" disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryImageFile">Primary Image (Optional)</Label>
            {watchedPrimaryImageFile instanceof File && (
                <div className="my-2">
                    <NextImage src={URL.createObjectURL(watchedPrimaryImageFile)} alt="New primary image preview" width={100} height={75} className="rounded-md border object-cover" />
                </div>
            )}
            <Input id="primaryImageFile" type="file" accept="image/*" {...register("primaryImageFile")} disabled={isSubmitting} />
            {errors.primaryImageFile && <p className="text-sm text-destructive mt-1">{errors.primaryImageFile.message as string}</p>}
            <Input id="primaryImageAlt" {...register("primaryImageAlt")} placeholder="Image description (alt text)" className="mt-1" disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>THC % (Optional)</Label>
              <Input type="number" step="0.1" {...register('thc.min')} placeholder="Min %" disabled={isSubmitting}/>
              {errors.thc?.min && <p className="text-sm text-destructive">{errors.thc.min.message}</p>}
               {errors.thc && !errors.thc.min && !errors.thc.max && errors.thc.message && <p className="text-sm text-destructive mt-1">{errors.thc.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label> {/* Spacer for alignment */}
              <Input type="number" step="0.1" {...register('thc.max')} placeholder="Max %" disabled={isSubmitting}/>
              {errors.thc?.max && <p className="text-sm text-destructive">{errors.thc.max.message}</p>}
            </div>
          </div>

           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CBD % (Optional)</Label>
              <Input type="number" step="0.1" {...register('cbd.min')} placeholder="Min %" disabled={isSubmitting}/>
              {errors.cbd?.min && <p className="text-sm text-destructive">{errors.cbd.min.message}</p>}
               {errors.cbd && !errors.cbd.min && !errors.cbd.max && errors.cbd.message && <p className="text-sm text-destructive mt-1">{errors.cbd.message}</p>}
            </div>
            <div className="space-y-2">
               <Label>&nbsp;</Label> {/* Spacer for alignment */}
              <Input type="number" step="0.1" {...register('cbd.max')} placeholder="Max %" disabled={isSubmitting}/>
              {errors.cbd?.max && <p className="text-sm text-destructive">{errors.cbd.max.message}</p>}
            </div>
          </div>
          <div className="pb-2"></div> {/* Padding at the end of scroll area */}
        </form>

        <DialogFooter className="p-6 pt-2 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="submit-cultivar-form-in-modal" disabled={isSubmitting} onClick={handleSubmit(handleCultivarSubmit)}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Submit Cultivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// We need to give the form an ID to link the external submit button in DialogFooter
// So, change form onSubmit to use this ID.
// <form id="submit-cultivar-form-in-modal" onSubmit={handleSubmit(handleCultivarSubmit)} ...>

// The button in footer will be:
// <Button type="submit" form="submit-cultivar-form-in-modal" ...>

// Corrected form tag:
// <form id="submit-cultivar-form-in-modal" onSubmit={handleSubmit(handleCultivarSubmit)} className="flex-grow overflow-y-auto px-6 space-y-4">
// And the button:
// <Button type="submit" form="submit-cultivar-form-in-modal" ... onClick={handleSubmit(handleCultivarSubmit)}> seems redundant.
// Just needs form="id"

// Final Check on form and button:
// <form id="theFormId" onSubmit={handleSubmit(handleCultivarSubmit)}>
// <Button type="submit" form="theFormId">Submit</Button> -- This is not how it works. The button type="submit" automatically submits its parent form.
// The DialogFooter is outside the form. So it should be:
// <form id="modal-form" onSubmit={handleSubmit(handleCultivarSubmit)} ... >
// <Button type="submit" form="modal-form" ... >Submit</Button> in the DialogFooter.

// The current structure: DialogFooter is outside the form element.
// The fix: wrap the `handleSubmit` directly in the button's onClick.
// Or, ensure the Button is actually of type submit and the form has an ID.
// The `handleSubmit` passed to `<form onSubmit={...}>` is correct. The button in footer should trigger this.
// Let's stick to the direct `onClick={handleSubmit(handleCultivarSubmit)}` on the footer button.
