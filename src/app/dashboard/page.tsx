'use client';

import { Scale, Heart, PawPrint } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
              <Logo />
            </div>
          );
    }


    return (
        <div>
            <PageHeader
                title={`Welcome Back, ${user?.email || '...'}`}
                description="Here's a summary of your pet's health and activity."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <StatCard
                    title="Current Weight"
                    value={`- kg`}
                    icon={<Scale className="h-5 w-5" />}
                    description="Last updated today"
                />
                <StatCard
                    title="Primary Goal"
                    value={"-"}
                    icon={<Heart className="h-5 w-5" />}
                    description="Focusing on a healthy life"
                />
                <StatCard
                    title="Avg. Daily Activity"
                    value="- mins"
                    icon={<PawPrint className="h-5 w-5" />}
                    description="-"
                />
            </div>

            <div className="grid gap-6">
                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="font-headline">Quick Insights</CardTitle>
                        <CardDescription>AI-powered observations about your pet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm list-disc list-inside">
                            <li>Create a pet profile to get AI insights.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
