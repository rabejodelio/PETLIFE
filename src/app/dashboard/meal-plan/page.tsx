'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-profile';

const mealPlanData = [
  { day: 'Monday', meals: { breakfast: 'Salmon & Sweet Potato Kibble (1 cup)', dinner: 'Lean Turkey with Green Beans (1/2 cup)' } },
  { day: 'Tuesday', meals: { breakfast: 'Salmon & Sweet Potato Kibble (1 cup)', dinner: 'Sardines in water with pumpkin puree' } },
  { day: 'Wednesday', meals: { breakfast: 'Salmon & Sweet Potato Kibble (1 cup)', dinner: 'Lean Turkey with Green Beans (1/2 cup)' } },
  { day: 'Thursday', meals: { breakfast: 'Salmon & Sweet Potato Kibble (1 cup)', dinner: 'Sardines in water with pumpkin puree' } },
  { day: 'Friday', meals: { breakfast: 'Salmon & Sweet Potato Kibble (1 cup)', dinner: 'Lean Turkey with Green Beans (1/2 cup)' } },
  { day: 'Saturday', meals: { breakfast: 'Salmon & Sweet Potato Kibble (1 cup)', dinner: 'A fun mix! Half kibble, half lean turkey' } },
  { day: 'Sunday', meals: { breakfast: 'Salmon & Sweet Potato Kibble (1 cup)', dinner: 'Lean Turkey with Green Beans (1/2 cup)' } },
];

export default function MealPlanPage() {
    const [loading, setLoading] = useState(false);
    const { profile } = usePetProfile();

    const handleGenerate = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1500);
    };

    return (
        <div>
            <PageHeader
                title="Your 7-Day Meal Plan"
                description={`A tailored nutrition plan for ${profile?.name} to help achieve the goal of weight loss.`}
            >
                <Button onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate New Plan'}
                </Button>
            </PageHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {mealPlanData.map((dayPlan) => (
                    <Card key={dayPlan.day} className="shadow-md">
                        <CardHeader>
                            <CardTitle className="font-headline">{dayPlan.day}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {loading ? (
                               <div className="space-y-4">
                                   <Skeleton className="h-8 w-3/4" />
                                   <Skeleton className="h-8 w-4/5" />
                               </div>
                           ) : (
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="text-sm font-semibold text-muted-foreground mt-1">AM</span>
                                    <p>{dayPlan.meals.breakfast}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-sm font-semibold text-muted-foreground mt-1">PM</span>
                                    <p>{dayPlan.meals.dinner}</p>
                                </div>
                            </div>
                           )}
                        </CardContent>
                    </Card>
                ))}
            </div>
             <Card className="mt-6 bg-accent/50 border-accent">
                <CardHeader className="flex-row items-center gap-4">
                    <Utensils className="w-8 h-8 text-accent-foreground" />
                    <div>
                        <CardTitle className="font-headline">Nutritionist's Note</CardTitle>
                        <CardDescription className="text-accent-foreground/80">
                            This plan is designed for gradual weight loss, avoiding chicken as requested. Ensure fresh water is always available.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
