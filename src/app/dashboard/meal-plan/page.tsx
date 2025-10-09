'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { generateMealPlanAction, type MealPlanInput } from './actions';
import type { MealPlanOutput } from '@/ai/ai-meal-planning';


export default function MealPlanPage() {
    const [loading, setLoading] = useState(false);
    const { profile } = usePetProfile();
    const [mealPlan, setMealPlan] = useState<string | null>(null);
    const [supplementRecommendation, setSupplementRecommendation] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!profile) return;
        setLoading(true);
        setError(null);

        const input: MealPlanInput = {
            animalName: profile.name,
            species: profile.species,
            age: profile.age,
            breed: profile.breed,
            weight: profile.weight,
            allergies: profile.allergies || 'none',
            healthObjective: profile.healthGoal === 'lose_weight' ? 'lose weight' : profile.healthGoal === 'maintain_weight' ? 'maintain weight' : 'improve joints'
        };

        const result = await generateMealPlanAction(input);

        if (result.success && result.data) {
            setMealPlan(result.data.mealPlan);
            setSupplementRecommendation(result.data.supplementRecommendation);
        } else {
            setError(result.error || 'An unknown error occurred.');
        }

        setLoading(false);
    };

    useEffect(() => {
        handleGenerate();
    }, [profile]);
    
    const parsedMealPlan = mealPlan?.split('\n').filter(day => day.trim().startsWith('Day'));

    return (
        <div>
            <PageHeader
                title="Your 7-Day Meal Plan"
                description={`A tailored nutrition plan for ${profile?.name} to help achieve their health goals.`}
            >
                <Button onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate New Plan'}
                </Button>
            </PageHeader>
            {loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                </Card>
            )}
            {!loading && !error && mealPlan && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {parsedMealPlan?.map((dayPlan, index) => {
                       const parts = dayPlan.split(':');
                       const day = parts[0]?.replace('Day ', '').trim();
                       const meals = parts.slice(1).join(':').split('Dinner:');
                       const breakfast = meals[0]?.replace('Breakfast:', '').trim();
                       const dinner = meals[1]?.trim();

                        return (
                        <Card key={index} className="shadow-md">
                            <CardHeader>
                                <CardTitle className="font-headline">Day {day}</CardTitle>
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
             <Card className="mt-6 bg-accent/50 border-accent">
                <CardHeader className="flex-row items-center gap-4">
                    <Utensils className="w-8 h-8 text-accent-foreground" />
                    <div>
                        <CardTitle className="font-headline">Supplement Recommendation</CardTitle>
                         {loading ? <Skeleton className="h-5 w-3/4 mt-1" /> : 
                            <CardDescription className="text-accent-foreground/80">
                                {supplementRecommendation}
                            </CardDescription>
                         }
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
