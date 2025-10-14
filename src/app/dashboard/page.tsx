'use client';

import { Scale, Heart, PawPrint } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { usePetProfile } from '@/hooks/use-pet-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { profile, loading } = usePetProfile();
    const router = useRouter();

    const healthGoalMap = {
        lose_weight: 'Lose Weight',
        maintain_weight: 'Maintain Weight',
        improve_joints: 'Improve Joints',
    };

    useEffect(() => {
        // Only redirect when loading is finished and there's no profile.
        if (!loading && !profile) {
            router.push('/dashboard/onboarding');
        }
    }, [loading, profile, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!profile) {
        // This will be briefly visible before the useEffect above redirects.
        // Or it can be a fallback while waiting for redirection.
        return null;
    }

    return (
        <div>
            <PageHeader
                title={`Welcome Back, ${profile?.name || '...'}`}
                description="Here's a summary of your pet's health and activity."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <StatCard
                    title="Current Weight"
                    value={`${profile?.weight || 0} kg`}
                    icon={<Scale className="h-5 w-5" />}
                    description="Last updated today"
                />
                <StatCard
                    title="Primary Goal"
                    value={healthGoalMap[profile?.healthGoal || 'maintain_weight']}
                    icon={<Heart className="h-5 w-5" />}
                    description="Focusing on a healthy life"
                />
                <StatCard
                    title="Avg. Daily Activity"
                    value="74 mins"
                    icon={<PawPrint className="h-5 w-5" />}
                    description="+14 mins from last week"
                />
            </div>

            <div className="grid gap-6">
                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="font-headline">Quick Insights</CardTitle>
                        <CardDescription>AI-powered observations about {profile?.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm list-disc list-inside">
                            <li>Jax's activity levels on Wednesday were a bit low. Try an extra evening walk.</li>
                            <li>Consider introducing a puzzle feeder to make meal times more engaging.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
