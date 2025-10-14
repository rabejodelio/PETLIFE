'use client';

import { useEffect, useState } from 'react';
import { Pill } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionItem } from '@/components/ui/accordion';

export default function SupplementsPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError('La fonctionnalité de profil d\'animal a été supprimée. Veuillez d\'abord créer un profil d\'animal.');
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
            />

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
                                <CardTitle className="text-destructive">Fonctionnalité non disponible</CardTitle>
                                <CardDescription className="text-destructive/80">{error}</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                    {!loading && !error && (
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <p className="text-sm text-muted-foreground p-4">Aucune recommandation à afficher.</p>
                            </AccordionItem>
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
