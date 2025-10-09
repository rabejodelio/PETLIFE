'use client';

import { useEffect, useState } from 'react';
import { Pill, Lightbulb } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupplementsPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            const fetchRecommendations = async () => {
                setLoading(true);
                setError(null);
                
                const healthNeedsMap = {
                    lose_weight: 'Weight management and joint support for overweight pets',
                    maintain_weight: 'General wellness and preventative care',
                    improve_joints: 'Joint health, mobility support, and inflammation reduction',
                };

                const input = {
                    species: profile.species,
                    age: profile.age,
                    breed: profile.breed,
                    weight: profile.weight,
                    allergies: profile.allergies || 'none',
                    healthNeeds: healthNeedsMap[profile.healthGoal],
                };

                const result = await getRecommendations(input);

                if (result.success && result.data) {
                    setRecommendations(result.data);
                } else {
                    setError(result.error || 'An unknown error occurred.');
                }
                setLoading(false);
            };

            fetchRecommendations();
        }
    }, [profile]);

    return (
        <div>
            <PageHeader
                title="Supplement Recommendations"
                description={`AI-powered suggestions for ${profile?.name}'s specific needs.`}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recommended for {profile?.name}</CardTitle>
                    <CardDescription>Based on age, breed, and health goals.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-6 w-2/3" />
                            </div>
                             <div className="flex items-center space-x-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
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
                    {!loading && !error && (
                        <ul className="space-y-4">
                            {recommendations.map((rec, index) => (
                                <li key={index} className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Pill className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-lg font-medium">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

             <Card className="mt-6 bg-accent/50 border-accent">
                <CardHeader className="flex-row items-start gap-4">
                    <Lightbulb className="w-6 h-6 text-accent-foreground flex-shrink-0 mt-1" />
                    <div>
                        <CardTitle className="font-headline">Why these recommendations?</CardTitle>
                        <CardDescription className="text-accent-foreground/80">
                           Our AI selected these supplements to support {profile?.name}'s goal of {profile?.healthGoal === 'lose_weight' ? 'weight loss' : 'joint improvement'}. Given {profile?.name} is a {profile?.breed}, they are prone to joint issues, and these selections provide proactive support.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
