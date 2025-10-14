'use client';

import { useEffect, useState } from 'react';
import { Pill, Lightbulb, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { SupplementRecommendationOutput } from '@/ai/flows/ai-supplement-recommendations';

type Recommendation = SupplementRecommendationOutput['recommendations'][0];

export default function SupplementsPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError('Pet profile functionality has been removed. Please create a pet profile first.');
        setLoading(false);
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    return (
        <div>
            <PageHeader
                title="Supplement Recommendations"
                description={`AI-powered suggestions for your pet's specific needs.`}
            >
                <Button onClick={fetchRecommendations} disabled={loading}>
                    {loading ? 'Generating...' : 'Regenerate'}
                </Button>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recommended for your pet</CardTitle>
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
                           Our AI selects supplements to support your pet's goals.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
