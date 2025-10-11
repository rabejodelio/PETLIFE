'use client';

import { useEffect, useState } from 'react';
import { Pill, Lightbulb, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { SupplementRecommendationOutput } from '@/ai/flows/ai-supplement-recommendations';

type Recommendation = SupplementRecommendationOutput['recommendations'][0];

export default function SupplementsPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        if (profile) {
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
                setRecommendations(result.data.recommendations);
            } else {
                setError(result.error || 'An unknown error occurred.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [profile]);

    return (
        <div>
            <PageHeader
                title="Supplement Recommendations"
                description={`AI-powered suggestions for ${profile?.name}'s specific needs.`}
            >
                <Button onClick={fetchRecommendations} disabled={loading}>
                    {loading ? 'Generating...' : 'Regenerate'}
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recommended for {profile?.name}</CardTitle>
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
                                <CardTitle className="text-destructive">Error</CardTitle>
                                <CardDescription className="text-destructive/80">{error}</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                    {!loading && !error && (
                        <Accordion type="single" collapsible className="w-full">
                            {recommendations.map((rec, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-4">
                                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Pill className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-lg font-medium text-left">{rec.name}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-16 text-muted-foreground">
                                        {rec.explanation}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
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
