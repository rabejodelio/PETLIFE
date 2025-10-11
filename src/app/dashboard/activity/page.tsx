'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Lightbulb, CalendarPlus, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ActivityPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const { toast } = useToast();

    const fetchRecommendations = async () => {
        if (profile) {
            setLoading(true);
            setError(null);
            setShowSchedule(false);
            const result = await getRecommendations({
                species: profile.species,
                breed: profile.breed,
                age: profile.age,
                healthGoal: profile.healthGoal,
            });

            if (result.success && result.data) {
                setRecommendations(result.data.recommendations);
            } else {
                setError(result.error || 'An unknown error occurred.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if(profile) {
            fetchRecommendations();
        }
    }, [profile]);
    
    const handleScheduleClick = () => {
        toast({
            title: "Activités programmées!",
            description: "Le programme de 7 jours a été créé pour votre animal.",
        });
        setShowSchedule(true);
    };
    
    const sampleSchedule = [
        { day: 'Day 1', am: 'Morning Walk (30 mins)', pm: 'Puzzle Feeder' },
        { day: 'Day 2', am: 'Fetch Session (15 mins)', pm: 'Short Training' },
        { day: 'Day 3', am: 'Morning Walk (35 mins)', pm: 'Play with a toy' },
        { day: 'Day 4', am: 'Sniffari walk (20 mins)', pm: 'Rest Day' },
        { day: 'Day 5', am: 'Morning Walk (30 mins)', pm: 'Evening Fetch' },
        { day: 'Day 6', am: 'Visit a new park', pm: 'Gentle Play' },
        { day: 'Day 7', am: 'Longer Walk (45 mins)', pm: 'Puzzle Feeder' },
    ];


    return (
        <div>
            <PageHeader
                title="Pet Activity"
                description="AI-powered activity suggestions for your pet."
            />

            <div className="grid grid-cols-1 gap-6">
                <Card className="shadow-md">
                    <CardHeader className="flex-row items-start gap-4">
                        <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <div>
                            <CardTitle className="font-headline">Quick Recommendations</CardTitle>
                            <CardDescription>AI-powered suggestions to help {profile?.name} reach their goal.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-5/6" />
                                <Skeleton className="h-5 w-4/5" />
                            </div>
                        )}
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        {!loading && !error && recommendations.length > 0 && (
                            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                {recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                    {!loading && !error && recommendations.length > 0 && (
                        <CardFooter>
                            <Button onClick={handleScheduleClick}>
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Programmer les activités
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {showSchedule && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Your 7-Day Activity Schedule</CardTitle>
                            <CardDescription>A weekly plan based on the recommendations to keep {profile?.name} active.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sampleSchedule.map((dayPlan, index) => (
                                <Card key={index} className="shadow-sm bg-muted/30">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold">{dayPlan.day}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                         <div className="flex items-start gap-3">
                                            <span className="font-semibold text-muted-foreground">AM:</span>
                                            <p>{dayPlan.am}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-muted-foreground">PM:</span>
                                            <p>{dayPlan.pm}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
