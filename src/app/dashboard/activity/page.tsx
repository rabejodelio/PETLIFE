
'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Footprints, Plus, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

const recentActivities = [
  { type: 'Walk', duration: '45 min', time: '8:00 AM' },
  { type: 'Play', duration: '20 min', time: '1:00 PM' },
  { type: 'Walk', duration: '30 min', time: '6:00 PM' },
];

export default function ActivityPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(true);

    useEffect(() => {
        if (profile) {
            setLoadingRecs(true);
            getRecommendations({
                species: profile.species,
                breed: profile.breed,
                age: profile.age,
                healthGoal: profile.healthGoal
            }).then(result => {
                if (result.success && result.data) {
                    setRecommendations(result.data.recommendations);
                }
                setLoadingRecs(false);
            });
        }
    }, [profile]);


    return (
        <div>
            <PageHeader
                title="Activity Tracking"
                description={`Monitor and log ${profile?.name}'s daily exercise.`}
            />

            <Card className="mb-6">
                <CardHeader className="flex-row items-start gap-4">
                    <Lightbulb className="w-6 h-6 text-accent-foreground flex-shrink-0 mt-1" />
                    <div>
                        <CardTitle className="font-headline">Quick Recommendations</CardTitle>
                        <CardDescription>
                            AI-powered suggestions to help {profile?.name} reach their goal.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingRecs ? (
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-5 w-4/5" />
                        </div>
                    ) : (
                        <ul className="space-y-2 text-sm list-disc list-inside">
                            {recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                </div>
                <div className="space-y-6">
                </div>
            </div>
        </div>
    );
}
