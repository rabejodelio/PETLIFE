'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { generateMealPlanAction, type MealPlanInput } from './actions';
import type { MealPlanOutput } from '@/ai/ai-meal-planning';

type ParsedMeal = {
    day: string;
    breakfast: string;
    dinner: string;
};

export default function MealPlanPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mealPlan, setMealPlan] = useState<MealPlanOutput | null>(null);
    const [parsedMealPlan, setParsedMealPlan] = useState<ParsedMeal[] | null>(null);
    const ingredientPrefsRef = useRef<HTMLTextAreaElement>(null);

    const parseRawMealPlan = (rawPlan: string): ParsedMeal[] => {
        if (!rawPlan) return [];
        const dayRegex = /Day\s*\d+:/gi;
        const days = rawPlan.split(dayRegex).filter(d => d.trim() !== '');
        
        return days.map((dayContent, index) => {
            const breakfastMatch = dayContent.match(/Breakfast:\s*([\s\S]*?)Dinner:/i);
            const dinnerMatch = dayContent.match(/Dinner:\s*([\s\S]*)/i);

            return {
                day: `Day ${index + 1}`,
                breakfast: breakfastMatch ? breakfastMatch[1].trim() : 'N/A',
                dinner: dinnerMatch ? dinnerMatch[1].trim() : 'N/A',
            };
        });
    };
    
    const handleGeneratePlan = async () => {
        if (!profile) return;
        setIsGenerating(true);
        setError(null);
        setMealPlan(null);
        setParsedMealPlan(null);

        const input: MealPlanInput = {
            animalName: profile.name,
            species: profile.species,
            age: profile.age,
            breed: profile.breed,
            weight: profile.weight,
            allergies: profile.allergies || 'None',
            healthObjective: profile.healthGoal,
            ingredientPreferences: ingredientPrefsRef.current?.value || 'Any high-quality food',
        };

        try {
            const result = await generateMealPlanAction(input);
            if (result.success && result.data) {
                setMealPlan(result.data);
                setParsedMealPlan(parseRawMealPlan(result.data.mealPlan));
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate meal plan.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    useEffect(() => {
        if (!profileLoading && profile) {
            handleGeneratePlan();
        }
    }, [profile, profileLoading]);

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
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
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to generate a meal plan.</p>
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
                title="Your 7-Day Meal Plan"
                description={`A tailored nutrition plan for ${profile.name} to help achieve their health goals.`}
            >
                <Button onClick={handleGeneratePlan} disabled={isGenerating}>
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
                                ref={ingredientPrefsRef}
                                placeholder="e.g., Hill's Science Diet Adult, cooked sweet potato, salmon oil"
                                defaultValue="Any high-quality food"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {(isGenerating && !parsedMealPlan) && (
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
                        <CardTitle className="text-destructive">Feature Unavailable</CardTitle>

                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                </Card>
            )}
            
            {parsedMealPlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {parsedMealPlan.map((meal, index) => (
                        <Card key={index} className="shadow-md">
                            <CardHeader>
                                <CardTitle className="font-headline">{meal.day}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <p className="font-semibold">Breakfast</p>
                                    <p className="text-muted-foreground">{meal.breakfast}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Dinner</p>
                                    <p className="text-muted-foreground">{meal.dinner}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {!isGenerating && !parsedMealPlan && !error && (
                <p className="text-muted-foreground text-center">Click "Regenerate Plan" to get started.</p>
            )}
        </div>
    );
}
