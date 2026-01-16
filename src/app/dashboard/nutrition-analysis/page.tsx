'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';
import { Pencil, Sparkles, FileText, FlaskConical } from 'lucide-react';
import { getNutritionAnalysisAction } from './actions';
import type { NutritionAnalysisOutput } from './actions';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function NutritionAnalysisPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<NutritionAnalysisOutput | null>(null);
    const [ingredients, setIngredients] = useState('');

    const handleGenerateAnalysis = async () => {
        if (!profile || !ingredients) return;
        setIsGenerating(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await getNutritionAnalysisAction({
                ingredientsText: ingredients,
                age: profile.age,
                species: profile.species,
            });
            if (result.success && result.data) {
                setAnalysis(result.data);
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
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to use the nutrition analyzer.</p>
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
                title="Analyseur de Nutrition de Précision"
                description="Évaluez les ingrédients de la nourriture de votre animal avec l'IA."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FlaskConical className="w-5 h-5" />
                                Ingrédients
                            </CardTitle>
                            <CardDescription>Collez la liste d'ingrédients ici.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="ingredients-text">Liste d'ingrédients</Label>
                                <Textarea
                                    id="ingredients-text"
                                    placeholder="Ex: Poulet, riz, graisse de poulet, pulpe de betterave..."
                                    className="resize-none min-h-[150px]"
                                    value={ingredients}
                                    onChange={(e) => setIngredients(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleGenerateAnalysis} disabled={isGenerating || !ingredients} className="w-full">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isGenerating ? 'Analyse en cours...' : 'Analyser les ingrédients'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="min-h-[20rem]">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                 Analyse de l'IA
                            </CardTitle>
                            <CardDescription>
                                Analyse nutritionnelle basée sur les directives FEDIAF.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isGenerating && (
                                <div className="space-y-3 pt-4">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-5 w-5/6" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                             )}
                             {error && (
                                <p className="text-destructive pt-4">{error}</p>
                             )}
                             {analysis && !isGenerating && (
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap prose prose-sm max-w-none">
                                    {analysis.analysis}
                                </div>
                             )}
                             {!analysis && !isGenerating && !error && (
                                <p className="text-sm text-muted-foreground text-center pt-10">
                                    Entrez une liste d'ingrédients et cliquez sur "Analyser" pour obtenir un rapport nutritionnel par IA.
                                </p>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
