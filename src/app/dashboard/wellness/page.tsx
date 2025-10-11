'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { getWellnessTipsAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';
import { z } from 'zod';

const WellnessTipSchema = z.object({
  title: z.string().describe('The title of the wellness tip.'),
  description: z.string().describe('The detailed description of the tip, providing actionable advice.'),
});
export type WellnessTip = z.infer<typeof WellnessTipSchema>;

export const WellnessTipsOutputSchema = z.object({
  tips: z
    .array(WellnessTipSchema)
    .min(4)
    .max(6)
    .describe('A list of 4 to 6 wellness tips for the specified pet species.'),
});

export default function WellnessPage() {
    const { profile } = usePetProfile();
    const [tips, setTips] = useState<WellnessTip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTips = async () => {
        if (profile) {
            setLoading(true);
            setError(null);
            const result = await getWellnessTipsAction({ species: profile.species });
            if (result.success && result.data) {
                setTips(result.data.tips);
            } else {
                setError(result.error || 'Failed to fetch wellness tips.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchTips();
        }
    }, [profile]);

    return (
        <div>
            <PageHeader
                title="Wellness & Enrichment"
                description={`AI-powered tips and techniques for a happy, stress-free ${profile?.species || 'pet'}.`}
            >
                <Button onClick={fetchTips} disabled={loading}>
                    {loading ? 'Generating...' : 'Get New Tips'}
                </Button>
            </PageHeader>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                         <Card key={i}>
                            <CardHeader className="flex-row items-start gap-4">
                                <Skeleton className="h-8 w-8 rounded-full mt-1" />
                                <div className='w-full'>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                     <Skeleton className="h-4 w-5/6 mt-2" />
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tips.map((tip, index) => (
                        <Card key={index} className="shadow-md">
                             <CardHeader className="flex-row items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent flex-shrink-0">
                                    <Lightbulb className="h-5 w-5 text-accent-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="font-headline text-xl mb-1">{tip.title}</CardTitle>
                                    <CardDescription>{tip.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
