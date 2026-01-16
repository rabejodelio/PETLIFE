'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';
import { Pencil, Sparkles, FileText, Home, Building } from 'lucide-react';
import { generateEnrichmentPlanAction } from './actions';
import type { EnrichmentPlanOutput } from '@/ai/flows/schemas';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function EnrichmentPlanPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<EnrichmentPlanOutput | null>(null);
    const [housingType, setHousingType] = useState<'apartment' | 'house'>('apartment');

    const handleGeneratePlan = async () => {
        if (!profile) return;
        setIsGenerating(true);
        setError(null);
        setPlan(null);

        try {
            const result = await generateEnrichmentPlanAction({
                animalName: profile.name,
                species: profile.species,
                breed: profile.breed,
                age: profile.age,
                housingType: housingType,
            });
            if (result.success && result.data) {
                setPlan(result.data);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate analysis.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No Pet Profile Found</h2>
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to generate an enrichment plan.</p>
                <Button asChild>
                    <Link href="/dashboard/profile/edit">
                        <Pencil className="mr-2 h-4 w-4" /> Create Profile
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Planificateur d'Enrichissement Anti-Stress"
                description="Réduisez le stress et l'ennui de votre animal avec des activités ciblées."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Home className="w-5 h-5" />
                                Environnement
                            </CardTitle>
                            <CardDescription>Sélectionnez le type de logement.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={housingType}
                                onValueChange={(value: 'apartment' | 'house') => setHousingType(value)}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="apartment" id="apartment" className="peer sr-only" />
                                    <Label
                                        htmlFor="apartment"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <Building className="mb-3 h-6 w-6" />
                                        Appartement
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="house" id="house" className="peer sr-only" />
                                    <Label
                                        htmlFor="house"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <Home className="mb-3 h-6 w-6" />
                                        Maison
                                    </Label>
                                </div>
                            </RadioGroup>
                            <Button onClick={handleGeneratePlan} disabled={isGenerating} className="w-full">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isGenerating ? 'Génération du plan...' : 'Générer un Plan d\'Action'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="min-h-[17.5rem]">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                 Recommandation du Jour
                            </CardTitle>
                            <CardDescription>
                                Une activité simple pour stimuler votre animal et réduire son stress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                             {isGenerating && (
                                <div className="space-y-3 pt-4 w-full">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-5 w-5/6" />
                                </div>
                             )}
                             {error && !isGenerating && (
                                <p className="text-destructive pt-4 text-center">{error}</p>
                             )}
                             {plan && !isGenerating && (
                                <blockquote className="mt-6 border-l-2 pl-6 italic">
                                    "{plan.plan}"
                                </blockquote>
                             )}
                             {!plan && !isGenerating && !error && (
                                <p className="text-sm text-muted-foreground text-center pt-10">
                                    Sélectionnez votre type de logement et cliquez sur "Générer" pour recevoir une activité d'enrichissement personnalisée.
                                </p>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
