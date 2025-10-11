'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                </Card>
            </div>
        </div>
    );
}
