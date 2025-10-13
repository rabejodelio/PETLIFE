'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Utensils, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-provider';
import { generateMealPlanAction, type MealPlanInput } from './actions';
import type { MealPlanOutput } from '@/ai/ai-meal-planning';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


export default function MealPlanPage() {
    const [loading, setLoading] = useState(false);
    const { profile } = usePetProfile();
    const [mealPlan, setMealPlan] = useState<string | null>(null);
    const [supplementRecommendation, setSupplementRecommendation] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const ingredientRef = useRef<HTMLTextAreaElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);

    const handleGenerate = async (firstLoad = false) => {
        if (!profile) return;
        
        // On first load, don't show loading spinners, just generate silently
        if (!firstLoad) {
            setIsGenerating(true);
            setLoading(true);
        } else {
            setIsGenerating(true);
        }

        setError(null);

        const input: MealPlanInput = {
            animalName: profile.name,
            species: profile.species,
            age: profile.age,
            breed: profile.breed,
            weight: profile.weight,
            allergies: profile.allergies || 'none',
            healthObjective: profile.healthGoal === 'lose_weight' ? 'lose weight' : profile.healthGoal === 'maintain_weight' ? 'maintain weight' : 'improve joints',
            ingredientPreferences: ingredientRef.current?.value || 'Any high-quality food',
        };

        const result = await generateMealPlanAction(input);

        if (result.success && result.data) {
            setMealPlan(result.data.mealPlan);
            setSupplementRecommendation(result.data.supplementRecommendation);
        } else {
            setError(result.error || 'An unknown error occurred.');
            setMealPlan(null);
            setSupplementRecommendation(null);
        }

        setLoading(false);
        setIsGenerating(false);
    };

    useEffect(() => {
        if (profile) {
            handleGenerate(true);
        }
    }, [profile]);
    
    const parsedMealPlan = mealPlan
        ?.split(/Day\s*\d+:/)
        .filter(s => s.trim() !== '')
        .map((plan, index) => ({
            day: `Day ${index + 1}`,
            plan: plan.trim()
        }));


    return (
        <div>
            <PageHeader
                title="Your 7-Day Meal Plan"
                description={`A tailored nutrition plan for ${profile?.name} to help achieve their health goals.`}
            >
                <Button onClick={() => handleGenerate(false)} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Regenerate Plan'}
                </Button>
            </PageHeader>
            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Ingredient Preferences</CardTitle>
                        <CardDescription>
                            List your pet's current food brands or any ingredients you'd like to include.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="grid w-full gap-1.5">
                            <Label htmlFor="ingredient-prefs">Current Brands / Ingredients</Label>
                            <Textarea 
                                id="ingredient-prefs" 
                                ref={ingredientRef}
                                placeholder="e.g., Hill's Science Diet Adult, cooked sweet potato, salmon oil"
                                defaultValue="Any high-quality food"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {(isGenerating && !mealPlan) && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Card key={i} className="shadow-md">
                            <CardHeader>
                                <Skeleton className="h-6 w-1/3" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="space-y-4">
                                   <Skeleton className="h-8 w-3/4" />
                                   <Skeleton className="h-8 w-4/5" />
                               </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
             {error && (
                 <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Generating Plan</CardTitle>

                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                </Card>
            )}
            {!isGenerating && mealPlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {parsedMealPlan?.map((dayPlan, index) => {
                       const breakfastMatch = dayPlan.plan.match(/Breakfast:(.*?)(Dinner:|$)/is);
                       const dinnerMatch = dayPlan.plan.match(/Dinner:(.*)/is);
                       
                       const breakfast = breakfastMatch ? breakfastMatch[1].trim() : 'Not specified';
                       const dinner = dinnerMatch ? dinnerMatch[1].trim() : 'Not specified';

                        return (
                        <Card key={index} className="shadow-md">
                            <CardHeader>
                                <CardTitle className="font-headline">{dayPlan.day}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-sm font-semibold text-muted-foreground mt-1">AM</span>
                                    <p>{breakfast}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-sm font-semibold text-muted-foreground mt-1">PM</span>
                                    <p>{dinner}</p>
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            )}
            <Collapsible open={isRecommendationOpen} onOpenChange={setIsRecommendationOpen} className="mt-6">
                 <Card className="bg-accent/50 border-accent">
                    <CollapsibleTrigger asChild>
                        <div className="flex justify-between items-center p-6 cursor-pointer">
                            <div className="flex items-center gap-4">
                                <Utensils className="w-8 h-8 text-accent-foreground" />
                                <div>
                                    <CardTitle className="font-headline">Supplement Recommendation</CardTitle>
                                    <CardDescription className="text-accent-foreground/80">Click to view</CardDescription>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="w-9 p-0">
                                <ChevronDown className={cn("h-6 w-6 transition-transform", isRecommendationOpen && "rotate-180")} />
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                             {isGenerating && !supplementRecommendation ? <Skeleton className="h-5 w-3/4 mt-1" /> : 
                                <p className="text-accent-foreground/90">
                                    {supplementRecommendation || 'Generate a plan to see supplement recommendations.'}
                                </p>
                             }
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
    );
}
