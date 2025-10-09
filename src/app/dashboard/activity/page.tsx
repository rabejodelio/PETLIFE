'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Footprints, Plus } from 'lucide-react';

const recentActivities = [
  { type: 'Walk', duration: '45 min', time: '8:00 AM' },
  { type: 'Play', duration: '20 min', time: '1:00 PM' },
  { type: 'Walk', duration: '30 min', time: '6:00 PM' },
];

export default function ActivityPage() {
    const { profile } = usePetProfile();

    return (
        <div>
            <PageHeader
                title="Activity Tracking"
                description={`Monitor and log ${profile?.name}'s daily exercise.`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityChart />
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Log New Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select activity type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="walk">Walk</SelectItem>
                                    <SelectItem value="run">Run</SelectItem>
                                    <SelectItem value="play">Play</SelectItem>
                                    <SelectItem value="training">Training</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="number" placeholder="Duration in minutes" />
                            <Button className="w-full"><Plus className="mr-2 h-4 w-4" /> Log Activity</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Today's Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {recentActivities.map((act, i) => (
                                    <li key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Footprints className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{act.type}</p>
                                                <p className="text-xs text-muted-foreground">{act.duration}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{act.time}</p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
