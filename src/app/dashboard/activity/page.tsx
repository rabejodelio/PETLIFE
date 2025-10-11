'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Lightbulb, Calendar as CalendarIcon, Footprints, Clock, Dumbbell, Wind, ToyBrick } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Sample logged activities data
const sampleLoggedActivities = {
    [format(new Date(), 'yyyy-MM-dd')]: [
        { type: 'Walk', duration: 30, icon: Footprints },
        { type: 'Play', duration: 15, icon: ToyBrick },
    ],
    [format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')]: [
        { type: 'Walk', duration: 45, icon: Footprints },
        { type: 'Training', duration: 10, icon: Dumbbell },
    ],
     [format(new Date(Date.now() - 2 * 86400000), 'yyyy-MM-dd')]: [
        { type: 'Hike', duration: 60, icon: Wind },
    ],
};

type Activity = {
    type: string;
    duration: number;
    icon: React.ElementType;
}

export default function ActivityPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    const [loggedActivities, setLoggedActivities] = useState<Record<string, Activity[]>>(sampleLoggedActivities);
    
    const dailyActivities = selectedDate ? loggedActivities[format(selectedDate, 'yyyy-MM-dd')] || [] : [];


    const fetchRecommendations = async () => {
        if (profile) {
            setLoading(true);
            setError(null);
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
    

    return (
        <div>
            <PageHeader
                title="Pet Activity"
                description="AI-powered activity suggestions and history for your pet."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
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
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                                Activities for {selectedDate ? format(selectedDate, 'PPP') : 'Today'}
                            </CardTitle>
                            <CardDescription>
                                {dailyActivities.length > 0 
                                    ? `Here's what ${profile?.name} did on this day.` 
                                    : `No activities logged for this day.`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {dailyActivities.length > 0 ? (
                                <div className="space-y-4">
                                {dailyActivities.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-4">
                                            <activity.icon className="w-6 h-6 text-primary" />
                                            <span className="font-medium">{activity.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>{activity.duration} mins</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Select a day to see the activity history.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card className="shadow-md">
                        <CardContent className="p-2">
                             <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="w-full"
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}