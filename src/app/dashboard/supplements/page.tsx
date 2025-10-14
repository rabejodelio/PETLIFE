'use client';

import { useEffect, useState } from 'react';
import { Pencil, Pill } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { usePetProfile } from '@/hooks/use-pet-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getRecommendations } from './actions';
import type { SupplementRecommendationOutput } from '@/ai/flows/ai-supplement-recommendations';

export default function SupplementsPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<SupplementRecommendationOutput['recommendations'] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        if (!profile) return;
        setLoading(true);
        setError(null);
        setRecommendations(null);

        try {
            const result = await getRecommendations({
                species: profile.species,
                age: profile.age,
                breed: profile.breed,
                weight: profile.weight,
                allergies: profile.allergies || 'None',
                healthNeeds: profile.healthGoal
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
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to see supplement recommendations.</p>
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
                title="Supplement Recommendations"
                description={`AI-powered suggestions for ${profile.name}'s specific needs.`}
            >
                 <Button onClick={fetchRecommendations} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recommended for {profile.name}</CardTitle>
                    <CardDescription>Based on age, breed, and health goals. Click on each one to learn more.</CardDescription>
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
                                <CardTitle className="text-destructive">Feature Unavailable</CardTitle>
                                <CardDescription className="text-destructive/80">{error}</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                    {!loading && !error && recommendations && (
                        <Accordion type="single" collapsible className="w-full">
                            {recommendations.map((rec, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-3">
                                            <Pill className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{rec.name}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-muted-foreground">{rec.explanation}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                     {!loading && !error && !recommendations && (
                        <p className="text-sm text-muted-foreground p-4">No recommendations to show.</p>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
