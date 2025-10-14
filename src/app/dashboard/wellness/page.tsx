'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

export default function WellnessPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTips = async () => {
        setLoading(true);
        setError('La fonctionnalité de profil d\'animal a été supprimée. Veuillez d\'abord créer un profil d\'animal.');
        setLoading(false);
    };

    useEffect(() => {
        fetchTips();
    }, []);

    return (
        <div>
            <PageHeader
                title="Wellness & Enrichment"
                description={`AI-powered tips and techniques for a happy, stress-free pet.`}
            >
                <Button onClick={fetchTips} disabled>
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
                        <CardTitle className="text-destructive">Fonctionnalité non disponible</CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <p className="text-sm text-muted-foreground p-4">Aucun conseil de bien-être à afficher.</p>
                </div>
            )}
        </div>
    );
}
