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
            description: "Les recommandations ont été ajoutées à votre calendrier.",
        });
        setShowSchedule(true);
    };
    
    const sampleSchedule = [
        { time: '08:00 AM', activity: 'Morning Walk (30 mins)' },
        { time: '01:00 PM', activity: 'Puzzle Feeder Challenge' },
        { time: '06:00 PM', activity: 'Evening Fetch Session (15 mins)' },
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
                     <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="font-headline">Your Schedule for Today</CardTitle>
                             <CardDescription>A plan based on the recommendations to keep {profile?.name} active.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {sampleSchedule.map((item, index) => (
                                <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="font-medium">{item.activity}</span>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Clock className="h-4 w-4" />
                                        <span>{item.time}</span>
                                    </div>
                                </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
