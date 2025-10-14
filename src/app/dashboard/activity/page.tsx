'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivityPage() {
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
                                    <CardTitle className="text-destructive">Fonctionnalité non disponible</CardTitle>
                                    <CardDescription className="text-destructive/80">{error}</CardDescription>
                                </CardHeader>
                            </Card>
                        )}
                         {!loading && !error && (
                            <p className="text-sm text-muted-foreground">Aucune recommandation à afficher.</p>
                         )}
                    </CardContent>
                    <CardFooter>
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
                         <p className="text-sm text-muted-foreground text-center md:text-left mt-8">Aucune activité enregistrée.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
