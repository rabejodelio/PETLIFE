'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Calendar as CalendarIcon, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';
import { getRecommendations } from './actions';
import type { ActivityRecommendationOutput } from '@/ai/flows/ai-activity-recommendation';


export default function ActivityPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<ActivityRecommendationOutput['recommendations'] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        if (!profile) return;
        setLoading(true);
        setError(null);
        setRecommendations(null);

        try {
            const result = await getRecommendations({
                species: profile.species,
                breed: profile.breed,
                age: profile.age,
                healthGoal: profile.healthGoal
            });
            if (result.success && result.data) {
                setRecommendations(result.data.recommendations);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch recommendations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!profileLoading && profile) {
            fetchRecommendations();
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
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to see activity recommendations.</p>
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
                title="Pet Activity"
                description="AI-powered activity suggestions and history for your pet."
            />

            <div className="space-y-6">
                <Card className="shadow-md">
                    <CardHeader className="flex-row items-start gap-4">
                        <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <div>
                            <CardTitle className="font-headline">Quick Recommendations</CardTitle>
                            <CardDescription>AI-powered suggestions to help your pet reach their goal.</CardDescription>
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
                        {error && (
                            <Card className="bg-destructive/10 border-destructive mt-4">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Feature Unavailable</CardTitle>
                                    <CardDescription className="text-destructive/80">{error}</CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                         {!loading && !error && recommendations && (
                            <ul className="space-y-2 list-disc list-inside text-sm">
                                {recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                         )}
                         {!loading && !error && !recommendations && (
                             <p className="text-sm text-muted-foreground">No recommendations to show.</p>
                         )}
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button onClick={fetchRecommendations} disabled={loading}>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button disabled>Schedule Activities</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            Activity History
                        </CardTitle>
                        <CardDescription>Select a date to view logged activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground text-center md:text-left mt-8">No logged activities.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
