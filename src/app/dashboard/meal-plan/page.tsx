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
import { Pencil, Sparkles, AlertTriangle } from 'lucide-react';
import { generateMealPlanAction, type MealPlanInput, type MealPlanOutput } from './actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

export default function MealPlanPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mealPlan, setMealPlan] = useState<MealPlanOutput | null>(null);
    const ingredientPrefsRef = useRef<HTMLTextAreaElement>(null);

    const handleGeneratePlan = async () => {
        if (!profile) return;
        setIsGenerating(true);
        setError(null);
        setMealPlan(null);

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
                    <Link href="/dashboard/profile">
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
                description={`A tailored nutrition plan for ${profile.name}.`}
            >
                <Button onClick={handleGeneratePlan} disabled={isGenerating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'update plan'}
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {isGenerating && (
                         <Card>
                            <CardHeader>
                                <Skeleton className="h-7 w-48" />
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-5/6" />
                                <Skeleton className="h-6 w-full" />
                             </CardContent>
                         </Card>
                    )}
                    {error && (
                        <Card className="bg-destructive/10 border-destructive">
                           <CardHeader className="flex-row items-center gap-4">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                                <CardTitle className="text-destructive">Generation Failed</CardTitle>
                           </CardHeader>
                            <CardContent>
                                <CardDescription className="text-destructive/80">{error}</CardDescription>
                            </CardContent>
                       </Card>
                    )}
                    {mealPlan && !isGenerating && !error &&(
                        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                            {mealPlan.weeklyPlan.map((dailyPlan, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="font-headline text-lg">{dailyPlan.day}</AccordionTrigger>
                                    <AccordionContent className="space-y-6">
                                        <div className="pl-4">
                                            <h3 className="font-semibold text-md mb-2">{dailyPlan.breakfast.title} (Breakfast)</h3>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dailyPlan.breakfast.recipe}</p>
                                        </div>
                                         <div className="pl-4">
                                            <h3 className="font-semibold text-md mb-2">{dailyPlan.dinner.title} (Dinner)</h3>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dailyPlan.dinner.recipe}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Ingredient Preferences</CardTitle>
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
                                <p className="text-xs text-muted-foreground">
                                    List your pet's current food or any ingredients you'd like to include.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {mealPlan && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Supplement Advice</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{mealPlan.supplementRecommendation}</p>
                                <Separator className="my-4" />
                                <p className="text-xs text-muted-foreground italic">{mealPlan.disclaimer}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
