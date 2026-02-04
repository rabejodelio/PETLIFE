'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';
import { Pencil, ShieldCheck, AlertTriangle } from 'lucide-react';
import { generatePreventionAdviceAction } from './actions';
import type { PreventionAdviceOutput } from '@/ai/flows/schemas';

export default function PreventionAssistantPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PreventionAdviceOutput | null>(null);

    useEffect(() => {
        if (!profileLoading && profile) {
            const fetchAdvice = async () => {
                setIsLoading(true);
                setError(null);
                setResult(null);

                // Ensure all required fields are present
                if (profile.sex === undefined || profile.sterilized === undefined) {
                    setError("Your pet's sex or sterilization status is not set. Please update the profile.");
                    setIsLoading(false);
                    return;
                }

                try {
                    const actionResult = await generatePreventionAdviceAction({
                        sex: profile.sex,
                        age: profile.age,
                        sterilized: profile.sterilized,
                    });
                    if (actionResult.success && actionResult.data) {
                        setResult(actionResult.data);
                    } else {
                        setError(actionResult.error || "An unknown error occurred.");
                    }
                } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed to fetch advice.');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAdvice();
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
                <p className="text-muted-foreground mt-2 mb-4">Create a profile to access the prevention assistant.</p>
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
                title="Prevention Assistant"
                description="Advice for your pet's long-term health."
            />

            <Card className={result?.needsAction ? 'border-amber-500' : ''}>
                 <CardHeader className="flex-row items-start gap-4">
                    {result?.needsAction ? (
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                    ) : (
                        <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    )}
                    <div>
                        <CardTitle className="font-headline">Prevention Advice for {profile.name}</CardTitle>
                        <CardDescription>
                            Based on their profile, here is a health recommendation.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                     {isLoading && (
                        <div className="space-y-3 pt-4">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-5/6" />
                        </div>
                     )}
                     {error && !isLoading && (
                        <p className="text-destructive pt-4">{error}</p>
                     )}
                     {result && !isLoading && (
                        <blockquote className="mt-2 border-l-2 pl-6 italic">
                            "{result.advice}"
                        </blockquote>
                     )}
                </CardContent>
            </Card>
            
             {error?.includes("sex or sterilization status") && (
                 <div className="mt-4 text-center">
                    <Button asChild>
                         <Link href="/dashboard/profile/edit">
                            <Pencil className="mr-2 h-4 w-4" /> Update Profile
                        </Link>
                    </Button>
                 </div>
            )}
        </div>
    );
}
