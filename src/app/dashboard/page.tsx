'use client';

import { Scale, Heart, PawPrint } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeightChart } from '@/components/dashboard/weight-chart';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
    const { profile, activityHistory, loading } = usePetProfile();

    const healthGoalMap = {
        lose_weight: 'Lose Weight',
        maintain_weight: 'Maintain Weight',
        improve_joints: 'Improve Joints',
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <Card className="max-w-md p-8">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Welcome to PetLife!</CardTitle>
                        <CardDescription>
                            It looks like you haven't created a pet profile yet. Let's create one to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/onboarding">Create Pet Profile</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
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
                    description="Target: 13 kg"
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

            <div className="grid gap-6 lg:grid-cols-2">
                <WeightChart />
                <ActivityChart activityHistory={activityHistory} />
            </div>

             <Card className="mt-6 shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline">Quick Insights</CardTitle>
                    <CardDescription>AI-powered observations about {profile?.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                        <li>Jax's weight is trending down nicely, keep up the great work!</li>
                        <li>Activity levels on Wednesday were a bit low. Try an extra evening walk.</li>
                        <li>Consider introducing a puzzle feeder to make meal times more engaging.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
