'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Review as ReviewType } from '@/types';
import { generateCultivarReview } from '@/ai/flows/generate-review';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ReviewFormProps {
  cultivarName: string;
  cultivarId: string;
  onReviewSubmit: (review: ReviewType) => void;
}

const reviewSchema = z.object({
  userExperience: z.string().min(10, 'Please describe your experience in at least 10 characters.'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5.'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function ReviewForm({ cultivarName, cultivarId, onReviewSubmit }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiGeneratedReview, setAiGeneratedReview] = useState<{ text: string; sentiment: number } | null>(null);
  const { toast } = useToast();

  const { control, handleSubmit, getValues, formState: { errors }, watch } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      userExperience: '',
      rating: 0,
    },
  });

  const userExperienceValue = watch("userExperience");

  const handleGenerateAndSubmit = async (data: ReviewFormData) => {
    setIsLoading(true);
    setAiGeneratedReview(null);
    try {
      const aiResult = await generateCultivarReview({
        cultivarName: cultivarName,
        userExperience: data.userExperience,
      });

      if (aiResult && aiResult.review) {
        setAiGeneratedReview({ text: aiResult.review, sentiment: aiResult.sentimentScore });
        
        const newReview: ReviewType = {
          id: new Date().toISOString() + Math.random().toString(36).substring(2,7), // more unique ID
          user: 'CannaConnoisseur', // Placeholder user
          rating: data.rating,
          text: aiResult.review,
          sentimentScore: aiResult.sentimentScore,
          createdAt: new Date().toISOString(),
        };
        onReviewSubmit(newReview);
        toast({
          title: 'Review Submitted!',
          description: 'Your AI-powered review has been added.',
          variant: 'default',
        });
      } else {
        throw new Error('AI could not generate a review.');
      }
    } catch (error) {
      console.error('Error generating or submitting review:', error);
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to generate or submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg animate-slideInUp">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Share Your Experience</CardTitle>
        <CardDescription>Let us know what you think about {cultivarName}. Your feedback helps others!</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleGenerateAndSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userExperience" className="font-semibold">Your Notes / Experience</Label>
            <Controller
              name="userExperience"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="userExperience"
                  placeholder={`Describe your experience with ${cultivarName}... How did it make you feel? What were the aromas and flavors like?`}
                  {...field}
                  rows={5}
                  className="bg-background"
                  aria-invalid={errors.userExperience ? "true" : "false"}
                  aria-describedby="userExperienceError"
                />
              )}
            />
            {errors.userExperience && <p id="userExperienceError" className="text-sm text-destructive">{errors.userExperience.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating" className="font-semibold">Your Rating (1-5 Stars)</Label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value}
                  onRate={(newRating) => field.onChange(newRating)}
                  size={28}
                />
              )}
            />
            {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
          </div>

          {aiGeneratedReview && (
             <Alert variant="default" className="bg-primary/10 border-primary/30">
               <Sparkles className="h-5 w-5 text-primary" />
               <AlertTitle className="font-headline text-primary">AI Generated Review Suggestion</AlertTitle>
               <AlertDescription className="font-body">
                 {aiGeneratedReview.text}
                 <br />
                 <small className="text-muted-foreground">Sentiment Score: {aiGeneratedReview.sentiment.toFixed(2)}</small>
               </AlertDescription>
             </Alert>
           )}

        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading || !userExperienceValue || (watch("rating") || 0) < 1} 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Processing...' : 'Generate & Submit AI-Powered Review'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
