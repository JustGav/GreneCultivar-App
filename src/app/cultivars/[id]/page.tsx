
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import type { Cultivar, Review as ReviewType, CannabinoidProfile, PlantCharacteristics, YieldProfile, AdditionalFileInfo, AdditionalInfoCategoryKey, Terpene, CultivarStatus } from '@/types';
import { getCultivarById, addReviewToCultivar, getCultivars } from '@/services/firebase';
import ImageGallery from '@/components/ImageGallery';
import ReviewForm from '@/components/ReviewForm';
import StarRating from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, CalendarDays, Leaf, MessageSquare, Percent, Smile, UserCircle, Timer, Sprout, Flower, ScissorsIcon as Scissors, Combine, Droplets, BarChartBig, Paperclip, Award, Image as LucideImage, FileText, FlaskConical, Palette, DollarSign, Sunrise, Stethoscope, ExternalLink, Network, Loader2, Database, ShieldCheck, Hourglass, Archive as ArchiveIconLucide, Info, Utensils, Star as StarIcon, Users, EyeOff } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import CultivarDetailLoading from './loading';

const calculateAverageRating = (reviews: ReviewType[]): number => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
};

const CannabinoidDisplay: React.FC<{ label: string; profile?: CannabinoidProfile }> = ({ label, profile }) => {
  if (!profile || profile.min === undefined || profile.max === undefined) {
    return <p className="text-sm">{label}: N/A</p>;
  }
  return (
    <p className="text-sm">{label}: {profile.min}% - {profile.max}%</p>
  );
};

const PlantCharacteristicDisplay: React.FC<{ label: string; value?: number; unit: string }> = ({ label, value, unit }) => {
  if (value === undefined) {
    return <p className="text-sm">{label}: N/A</p>;
  }
  return (
    <p className="text-sm">{label}: {value}{unit}</p>
  );
};

const YieldRangeDisplay: React.FC<{ label: string; profile?: YieldProfile; unitSuffix: string }> = ({ label, profile, unitSuffix }) => {
  if (!profile || profile.min === undefined || profile.max === undefined) {
    return <p className="text-sm">{label}: N/A</p>;
  }
  return (
    <p className="text-sm">{label}: {profile.min} - {profile.max} {unitSuffix}</p>
  );
};

const additionalInfoCategoriesConfig: Record<AdditionalInfoCategoryKey, { title: string; icon: React.ElementType }> = {
  geneticCertificate: { title: 'Genetic Certificate', icon: Award },
  plantPicture: { title: 'Plant Pictures', icon: LucideImage },
  cannabinoidInfo: { title: 'Cannabinoid Information', icon: FileText },
  terpeneInfo: { title: 'Terpene Information', icon: FlaskConical },
};

const STATUS_LABELS: Record<CultivarStatus, string> = {
  Live: 'Live',
  featured: 'Featured',
  recentlyAdded: 'Recently Added',
  'User Submitted': 'User Submitted',
  Hide: 'Hidden',
  archived: 'Archived',
};

const getStatusBadgeVariant = (status?: CultivarStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (!status) return 'outline';
  switch (status) {
    case 'Live': return 'default';
    case 'featured': return 'default';
    case 'User Submitted': return 'secondary';
    case 'recentlyAdded': return 'secondary';
    case 'Hide': return 'destructive';
    case 'archived': return 'destructive';
    default: return 'outline';
  }
};

const getStatusIcon = (status?: CultivarStatus) => {
  if (!status) return <Info size={16} className="mr-1.5" />;
  switch (status) {
    case 'Live': return <ShieldCheck size={16} className="mr-1.5 text-green-500" />;
    case 'featured': return <StarIcon size={16} className="mr-1.5 text-yellow-500 fill-yellow-500" />;
    case 'User Submitted': return <Users size={16} className="mr-1.5" />;
    case 'recentlyAdded': return <Hourglass size={16} className="mr-1.5" />;
    case 'Hide': return <EyeOff size={16} className="mr-1.5" />;
    case 'archived': return <ArchiveIconLucide size={16} className="mr-1.5" />;
    default: return <Info size={16} className="mr-1.5" />;
  }
};

const NEGATIVE_EFFECTS = ['Dry Mouth', 'Dry Eyes', 'Paranoid', 'Anxious', 'Dizzy'];


export default function CultivarDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [cultivar, setCultivar] = useState<Cultivar | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [cultivarNameMap, setCultivarNameMap] = useState<Map<string, string>>(new Map());

  const fetchCultivarData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const foundCultivar = await getCultivarById(id);
      if (foundCultivar) {
        setCultivar(foundCultivar);
        setAverageRating(calculateAverageRating(foundCultivar.reviews || []));
      } else {
        setError("Cultivar not found.");
      }

      try {
        const allCultivarsData = await getCultivars();
        const nameMap = new Map<string, string>();
        allCultivarsData.forEach(c => {
            nameMap.set(c.name.toLowerCase(), c.id); 
        });
        setCultivarNameMap(nameMap);
      } catch (err) {
        console.warn("Failed to fetch all cultivars for lineage linking:", err);
      }

    } catch (err) {
      console.error("Failed to fetch cultivar:", err);
      setError("Failed to load cultivar data. Please try again.");
      toast({
        title: "Error",
        description: "Could not load cultivar details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchCultivarData();
  }, [fetchCultivarData]);

  const handleReviewSubmit = useCallback(async (newReview: ReviewType) => {
    if (!cultivar) return;
    try {
      await addReviewToCultivar(cultivar.id, newReview);
      const updatedCultivar = await getCultivarById(cultivar.id);
      if (updatedCultivar) {
        setCultivar(updatedCultivar);
        setAverageRating(calculateAverageRating(updatedCultivar.reviews || []));
      }
      toast({
        title: "Review Added",
        description: "Your review has been successfully submitted.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast({
        title: "Error",
        description: "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    }
  }, [cultivar, toast]);

  if (isLoading) {
    return <CultivarDetailLoading />;
  }

  if (error) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-fadeIn">
        <AlertCircle size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-headline text-destructive mb-2">{error}</h1>
        <Link href="/">
          <Button variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Browser
          </Button>
        </Link>
      </div>
    );
  }

  if (!cultivar) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 animate-fadeIn">
        <AlertCircle size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-headline text-destructive mb-2">Cultivar Not Found</h1>
        <p className="text-muted-foreground font-body mb-6">
          Sorry, we couldn&apos;t find the cultivar you&apos;re looking for.
        </p>
        <Link href="/">
          <Button variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Browser
          </Button>
        </Link>
      </div>
    );
  }

  const hasPlantCharacteristics = cultivar.plantCharacteristics && (
    cultivar.plantCharacteristics.minHeight !== undefined ||
    cultivar.plantCharacteristics.maxHeight !== undefined ||
    cultivar.plantCharacteristics.minMoisture !== undefined ||
    cultivar.plantCharacteristics.maxMoisture !== undefined ||
    cultivar.plantCharacteristics.yieldPerPlant !== undefined ||
    cultivar.plantCharacteristics.yieldPerWatt !== undefined ||
    cultivar.plantCharacteristics.yieldPerM2 !== undefined
  );

  const hasAdditionalInfo = cultivar.additionalInfo && Object.values(cultivar.additionalInfo).some(files => files && files.length > 0);
  const hasTerpeneProfile = cultivar.terpeneProfile && cultivar.terpeneProfile.length > 0;
  const hasPricingInfo = cultivar.pricing && (cultivar.pricing.min !== undefined || cultivar.pricing.max !== undefined || cultivar.pricing.avg !== undefined);
  const hasCultivationPhases = cultivar.cultivationPhases && (
    cultivar.cultivationPhases.germination ||
    cultivar.cultivationPhases.rooting ||
    cultivar.cultivationPhases.vegetative ||
    cultivar.cultivationPhases.flowering ||
    cultivar.cultivationPhases.harvest
  );
  const hasEffects = cultivar.effects && cultivar.effects.length > 0;
  const hasMedicalEffects = cultivar.medicalEffects && cultivar.medicalEffects.length > 0;
  const hasFlavors = cultivar.flavors && cultivar.flavors.length > 0;
  const hasLineage = (cultivar.parents && cultivar.parents.length > 0) || (cultivar.children && cultivar.children.length > 0);


  return (
    <div className="space-y-8 animate-fadeIn">
      <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6 font-medium">
        <ArrowLeft size={20} className="mr-1" />
        Back to Cultivar Browser
      </Link>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={cultivar.images} cultivarName={cultivar.name} />

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-4xl text-primary flex items-center">
                  <Leaf size={36} className="mr-3 text-primary/80" /> {cultivar.name}
                </CardTitle>
                {cultivar.status && (
                  <Badge 
                    variant={getStatusBadgeVariant(cultivar.status)} 
                    className={cn(
                        "capitalize text-sm h-fit flex items-center py-1.5 px-3",
                        cultivar.status === 'featured' && "bg-yellow-400/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300",
                        cultivar.status === 'Hide' && "bg-gray-400/20 border-gray-500/50 text-gray-700 dark:text-gray-300"
                    )}
                  >
                      {getStatusIcon(cultivar.status)}
                      {STATUS_LABELS[cultivar.status]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="text-sm">{cultivar.genetics}</Badge>
                {averageRating > 0 && (
                  <>
                    <StarRating rating={averageRating} readOnly size={22} />
                    <span className="text-sm text-muted-foreground">({(cultivar.reviews || []).length} reviews)</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-body text-foreground/90 leading-relaxed mb-6">{cultivar.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6 text-muted-foreground">
                {cultivar.supplierUrl && (
                    <div>
                        <a href={cultivar.supplierUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:text-accent font-medium transition-colors">
                            <ExternalLink size={16} className="mr-2"/>
                            Visit Supplier
                        </a>
                    </div>
                )}
                {cultivar.source && (
                    <div className="flex items-center">
                       <Database size={16} className="mr-2" />
                       <span className="font-medium mr-1 text-foreground/80">Source:</span> {cultivar.source}
                    </div>
                )}
                 {cultivar.createdAt && (
                  <div className="flex items-center">
                    <CalendarDays size={16} className="mr-2" />
                    <span className="font-medium mr-1 text-foreground/80">Added:</span>
                    {formatDistanceToNow(parseISO(cultivar.createdAt), { addSuffix: true })}
                  </div>
                )}
                {cultivar.updatedAt && cultivar.updatedAt !== cultivar.createdAt && (
                  <div className="flex items-center">
                    <CalendarDays size={16} className="mr-2" />
                    <span className="font-medium mr-1 text-foreground/80">Updated:</span>
                    {formatDistanceToNow(parseISO(cultivar.updatedAt), { addSuffix: true })}
                  </div>
                )}
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center"><Percent size={20} className="mr-2 text-accent"/>Cannabinoid Profile</h3>
                  <CannabinoidDisplay label="THC" profile={cultivar.thc} />
                  <CannabinoidDisplay label="CBD" profile={cultivar.cbd} />
                  <CannabinoidDisplay label="CBC" profile={cultivar.cbc} />
                  <CannabinoidDisplay label="CBG" profile={cultivar.cbg} />
                  <CannabinoidDisplay label="CBN" profile={cultivar.cbn} />
                  <CannabinoidDisplay label="THCV" profile={cultivar.thcv} />
                </div>
              </div>

              {hasTerpeneProfile && cultivar.terpeneProfile && (
                <div className="mb-6 pt-6 border-t">
                  <h3 className="font-semibold text-lg flex items-center mb-3">
                    <Palette size={20} className="mr-2 text-accent" />
                    Terpene Profile
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                    {cultivar.terpeneProfile.map(terpene => (
                      <div key={terpene.id} className="text-sm p-3 bg-muted/50 rounded-md shadow-sm">
                        <p className="font-medium text-foreground/90">
                          {terpene.name}
                          {terpene.percentage && terpene.percentage > 0 ? (
                            <span className="text-xs text-muted-foreground ml-1">({terpene.percentage}%)</span>
                          ) : null}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasPlantCharacteristics && cultivar.plantCharacteristics && (
                <div className="mb-6 pt-6 border-t">
                  <h3 className="font-semibold text-lg flex items-center mb-3"><Combine size={20} className="mr-2 text-accent"/>Plant Characteristics</h3>

                  {(cultivar.plantCharacteristics.minHeight !== undefined || cultivar.plantCharacteristics.maxHeight !== undefined) && (
                    <div className="pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <PlantCharacteristicDisplay label="Min. Height" value={cultivar.plantCharacteristics.minHeight} unit="cm" />
                        <PlantCharacteristicDisplay label="Max. Height" value={cultivar.plantCharacteristics.maxHeight} unit="cm" />
                      </div>
                    </div>
                  )}

                  {(cultivar.plantCharacteristics.minMoisture !== undefined || cultivar.plantCharacteristics.maxMoisture !== undefined) && (
                    <div className={cn("pt-4 pb-4", (cultivar.plantCharacteristics.minHeight !== undefined || cultivar.plantCharacteristics.maxHeight !== undefined) && "border-t border-dashed")}>
                      <h4 className="font-medium text-md flex items-center mb-2"><Droplets size={18} className="mr-2 text-accent/80"/>Dry Product Moisture</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <PlantCharacteristicDisplay label="Min. Moisture" value={cultivar.plantCharacteristics.minMoisture} unit="%" />
                        <PlantCharacteristicDisplay label="Max. Moisture" value={cultivar.plantCharacteristics.maxMoisture} unit="%" />
                      </div>
                    </div>
                  )}

                  {(cultivar.plantCharacteristics.yieldPerPlant || cultivar.plantCharacteristics.yieldPerWatt || cultivar.plantCharacteristics.yieldPerM2) && (
                     <div className={cn("pt-4", ((cultivar.plantCharacteristics.minHeight !== undefined || cultivar.plantCharacteristics.maxHeight !== undefined) || (cultivar.plantCharacteristics.minMoisture !== undefined || cultivar.plantCharacteristics.maxMoisture !== undefined)) && "border-t border-dashed")}>
                      <h4 className="font-medium text-md flex items-center mb-2"><BarChartBig size={18} className="mr-2 text-accent/80"/>Estimated Yield</h4>
                      <div className="space-y-1 text-sm">
                        <YieldRangeDisplay label="Yield per Plant" profile={cultivar.plantCharacteristics.yieldPerPlant} unitSuffix="g" />
                        <YieldRangeDisplay label="Yield per Watt" profile={cultivar.plantCharacteristics.yieldPerWatt} unitSuffix="g/W" />
                        <YieldRangeDisplay label="Yield per m²" profile={cultivar.plantCharacteristics.yieldPerM2} unitSuffix="g/m²" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {hasCultivationPhases && cultivar.cultivationPhases && (
                <div className="pt-6 border-t">
                   <h3 className="font-semibold text-lg flex items-center mb-4"><Timer size={20} className="mr-2 text-accent"/>Estimated Cultivation Phases</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {cultivar.cultivationPhases.germination && (
                        <div className="flex items-center">
                          <Sunrise size={18} className="mr-2 text-primary/70" />
                          <strong>Germination:</strong>&nbsp;{cultivar.cultivationPhases.germination}
                        </div>
                      )}
                      {cultivar.cultivationPhases.rooting && (
                        <div className="flex items-center">
                          <Sprout size={18} className="mr-2 text-primary/70" />
                          <strong>Rooting:</strong>&nbsp;{cultivar.cultivationPhases.rooting}
                        </div>
                      )}
                      {cultivar.cultivationPhases.vegetative && (
                        <div className="flex items-center">
                          <Leaf size={18} className="mr-2 text-primary/70" />
                          <strong>Vegetative:</strong>&nbsp;{cultivar.cultivationPhases.vegetative}
                        </div>
                      )}
                      {cultivar.cultivationPhases.flowering && (
                        <div className="flex items-center">
                          <Flower size={18} className="mr-2 text-primary/70" />
                          <strong>Flowering:</strong>&nbsp;{cultivar.cultivationPhases.flowering}
                        </div>
                      )}
                      {cultivar.cultivationPhases.harvest && (
                        <div className="flex items-center">
                          <Scissors size={18} className="mr-2 text-primary/70" />
                          <strong>Harvest:</strong>&nbsp;{cultivar.cultivationPhases.harvest}
                        </div>
                      )}
                   </div>
                </div>
              )}

              {hasPricingInfo && cultivar.pricing && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-lg flex items-center mb-3">
                    <DollarSign size={20} className="mr-2 text-accent" />
                    Estimated Pricing (per gram)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    <p>Min: {cultivar.pricing.min !== undefined ? `€${cultivar.pricing.min.toFixed(2)}` : 'N/A'}</p>
                    <p>Max: {cultivar.pricing.max !== undefined ? `€${cultivar.pricing.max.toFixed(2)}` : 'N/A'}</p>
                    <p>Avg: {cultivar.pricing.avg !== undefined ? `€${cultivar.pricing.avg.toFixed(2)}` : 'N/A'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {hasEffects && cultivar.effects && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center">
                  <Smile size={28} className="mr-3 text-primary/80" /> Reported Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cultivar.effects.map(effect => {
                    const isNegative = NEGATIVE_EFFECTS.includes(effect);
                    return (
                      <Badge
                        key={effect}
                        variant="outline"
                        className={cn(
                          "text-black",
                          isNegative
                            ? 'bg-destructive/10 border-destructive/30'
                            : 'bg-primary/10 border-primary/30'
                        )}
                      >
                        {effect}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {hasFlavors && cultivar.flavors && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center">
                  <Utensils size={28} className="mr-3 text-primary/80" /> Reported Flavors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cultivar.flavors.map(flavor => (
                    <Badge key={flavor} variant="secondary" className="bg-primary/5 border-primary/20 text-foreground/90">{flavor}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {hasMedicalEffects && cultivar.medicalEffects && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center">
                  <Stethoscope size={28} className="mr-3 text-primary/80" /> Potential Medical Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cultivar.medicalEffects.map(effect => (
                    <Badge key={effect} variant="secondary" className="bg-primary/10 border-primary/30 text-foreground/90">{effect}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {hasLineage && (
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center">
                  <Network size={28} className="mr-3 text-primary/80" /> Lineage Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                {cultivar.parents && cultivar.parents.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Parents</h4>
                    <div className="flex justify-center items-center space-x-3 flex-wrap gap-y-2">
                      {cultivar.parents.map((parentName, index) => {
                        const parentId = cultivarNameMap.get(parentName.toLowerCase());
                        return parentId ? (
                          <Link key={`parent-${index}`} href={`/cultivars/${parentId}`} className="p-2 border rounded-md shadow-sm bg-muted/40 text-sm text-primary hover:underline hover:bg-muted/60 transition-colors">
                            {parentName}
                          </Link>
                        ) : (
                          <div key={`parent-${index}`} className="p-2 border rounded-md shadow-sm bg-muted/40 text-sm">
                            {parentName}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center mt-2">
                      <div className="w-px h-4 bg-border"></div>
                    </div>
                  </div>
                )}

                <div className="p-3 border-2 border-primary rounded-lg shadow-md bg-primary/10 inline-block">
                  <h3 className="text-lg font-semibold text-primary">{cultivar.name}</h3>
                  <p className="text-xs text-muted-foreground">Current Cultivar</p>
                </div>

                {cultivar.children && cultivar.children.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-center mb-2">
                      <div className="w-px h-4 bg-border"></div>
                    </div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Children</h4>
                    <div className="flex justify-center items-center space-x-3 flex-wrap gap-y-2">
                      {cultivar.children.map((childName, index) => {
                        const childId = cultivarNameMap.get(childName.toLowerCase());
                        return childId ? (
                          <Link key={`child-${index}`} href={`/cultivars/${childId}`} className="p-2 border rounded-md shadow-sm bg-muted/40 text-sm text-primary hover:underline hover:bg-muted/60 transition-colors">
                            {childName}
                          </Link>
                        ) : (
                          <div key={`child-${index}`} className="p-2 border rounded-md shadow-sm bg-muted/40 text-sm">
                            {childName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(!cultivar.parents || cultivar.parents.length === 0) && (!cultivar.children || cultivar.children.length === 0) && (
                  <p className="text-muted-foreground text-sm">No lineage information available.</p>
                )}
              </CardContent>
            </Card>
          )}


          {hasAdditionalInfo && cultivar.additionalInfo && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary flex items-center">
                  <Paperclip size={28} className="mr-3 text-primary/80" /> Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(Object.keys(additionalInfoCategoriesConfig) as AdditionalInfoCategoryKey[]).map((key) => {
                  const categoryConfig = additionalInfoCategoriesConfig[key];
                  const files = cultivar.additionalInfo![key];
                  if (files && files.length > 0) {
                    const IconComponent = categoryConfig.icon;
                    return (
                      <div key={key} className="pt-4 border-t first:border-t-0 first:pt-0">
                        <h4 className="font-semibold text-lg flex items-center mb-3">
                          <IconComponent size={20} className="mr-2 text-accent" />
                          {categoryConfig.title}
                        </h4>
                        <ul className="space-y-2 pl-1">
                          {files.map(file => (
                            <li key={file.id} className="text-sm">
                              {file.fileType === 'image' && file.url ? (
                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                  <NextImage
                                    src={file.url}
                                    alt={file.name}
                                    data-ai-hint={file['data-ai-hint'] as string}
                                    width={80}
                                    height={60}
                                    className="rounded-md object-cover border"
                                  />
                                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                    {file.name}
                                  </a>
                                </div>
                              ) : (
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                                  <FileText size={18} className="mr-2 text-muted-foreground" />
                                  <span className="font-medium">{file.name}</span>
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return null;
                })}
              </CardContent>
            </Card>
          )}

        </div>

        <div className="lg:col-span-1 space-y-6">
          <ReviewForm cultivarName={cultivar.name} cultivarId={cultivar.id} onReviewSubmit={handleReviewSubmit} />
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-3xl font-headline text-primary mb-6 flex items-center">
          <MessageSquare size={30} className="mr-3 text-primary/80"/>User Reviews
        </h2>
        {cultivar.reviews && cultivar.reviews.length > 0 ? (
          <div className="space-y-6">
            {cultivar.reviews.map(review => (
              <Card key={review.id} className="shadow-md animate-slideInUp">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <UserCircle size={22} className="mr-2 text-muted-foreground"/> {review.user}
                      </CardTitle>
                      <StarRating rating={review.rating} readOnly size={18} className="mt-1" />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div className="flex items-center">
                        <CalendarDays size={14} className="mr-1"/>
                        {review.createdAt ? formatDistanceToNow(parseISO(review.createdAt), { addSuffix: true }) : 'Date N/A'}
                      </div>
                      {review.sentimentScore !== undefined && (
                        <p className="mt-1">Sentiment: <span className={review.sentimentScore >= 0.5 ? 'text-green-600' : review.sentimentScore <= -0.5 ? 'text-red-600' : 'text-yellow-600'}>{review.sentimentScore.toFixed(2)}</span></p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-foreground/80 leading-normal">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-8 text-center bg-muted/50">
            <CardContent>
              <MessageSquare size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-body">No reviews yet for {cultivar.name}.</p>
              <p className="text-sm text-muted-foreground font-body mt-1">Be the first to share your experience!</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

