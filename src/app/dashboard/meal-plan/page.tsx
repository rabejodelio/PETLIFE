'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function MealPlanPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>('La fonctionnalité de profil d\'animal a été supprimée. Veuillez d\'abord créer un profil d\'animal.');

    const parsedMealPlan = null;

    return (
        <div>
            <PageHeader
                title="Your 7-Day Meal Plan"
                description={`A tailored nutrition plan for your pet to help achieve their health goals.`}
            >
                <Button disabled>
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
                                placeholder="e.g., Hill's Science Diet Adult, cooked sweet potato, salmon oil"
                                defaultValue="Any high-quality food"
                                disabled
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
                        <CardTitle className="text-destructive">Fonctionnalité non disponible</CardTitle>

                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
