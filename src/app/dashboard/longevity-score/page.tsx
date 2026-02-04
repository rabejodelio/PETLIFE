'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';
import { Pencil, Sparkles, FileText, Scale } from 'lucide-react';
import { getLongevityScoreAction } from './actions';
import type { LongevityScoreOutput } from '@/ai/flows/ai-longevity-score';
import ReactMarkdown from 'react-markdown';

export default function LongevityScorePage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<LongevityScoreOutput | null>(null);

    const handleGenerateScore = async () => {
        if (!profile) return;
        setIsGenerating(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await getLongevityScoreAction({
                currentWeight: profile.weight,
                breed: profile.breed,
            });
            if (result.success && result.data) {
                setAnalysis(result.data);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate analysis.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-8 w-2/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
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
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to calculate the longevity score.</p>
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
                title="Longevity Score Calculator"
                description="Assess your pet's 'Body Condition Score' (BCS) and get a detailed analysis."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Scale className="w-5 h-5" />
                                Current Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Breed</p>
                                <p className="font-semibold">{profile.breed}</p>
                            </div>
                             <div>
                                <p className="text-sm font-medium text-muted-foreground">Current Weight</p>
                                <p className="font-semibold">{profile.weight} kg</p>
                            </div>
                            <Button onClick={handleGenerateScore} disabled={isGenerating} className="w-full">
                                <Sparkles className="mr-2 h-4 w-4" />
                                {isGenerating ? 'Analyzing...' : 'Calculate Score'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="min-h-[20rem]">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                 Analysis
                            </CardTitle>
                            <CardDescription>
                                Analysis based on WSAVA veterinary nutrition standards.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isGenerating && (
                                <div className="space-y-3 pt-4">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-5 w-5/6" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                             )}
                             {error && (
                                <p className="text-destructive pt-4">{error}</p>
                             )}
                             {analysis && !isGenerating && (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
                                </div>
                             )}
                             {!analysis && !isGenerating && !error && (
                                <p className="text-sm text-muted-foreground text-center pt-10">
                                    Click "Calculate Score" to get your pet's longevity analysis.
                                </p>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
