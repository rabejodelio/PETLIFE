'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Pencil } from 'lucide-react';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';

export default function WellnessPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTips = async () => {
        if (!profile) return;
        setLoading(true);
        setError(null);
        // Placeholder for fetching logic
        setLoading(false);
    };

    useEffect(() => {
        if (!profileLoading && profile) {
            fetchTips();
        }
    }, [profile, profileLoading]);

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
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
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No Pet Profile Found</h2>
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to get wellness tips.</p>
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
                title="Wellness & Enrichment"
                description={`AI-powered tips and techniques for a happy, stress-free pet.`}
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
                        <CardTitle className="text-destructive">Feature Unavailable</CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <p className="text-sm text-muted-foreground p-4">No wellness tips to show.</p>
                </div>
            )}
        </div>
    );
}
