'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Footprints, Plus, Lightbulb, Activity as ActivityIcon, Dumbbell, ToyBrick, Wind, Waves, Mountain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ActivityRecommendationOutput } from '@/ai/flows/ai-activity-recommendation';


type ActivityType = 'Walk' | 'Run' | 'Play' | 'Training' | 'Fetch' | 'Hike' | 'Swimming';

type Activity = {
    type: ActivityType;
    duration: number;
    time: string;
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
    'Walk': <Footprints className="h-5 w-5" />,
    'Run': <Wind className="h-5 w-5" />,
    'Play': <ToyBrick className="h-5 w-5" />,
    'Training': <Dumbbell className="h-5 w-5" />,
    'Fetch': <ActivityIcon className="h-5 w-5" />,
    'Hike': <Mountain className="h-5 w-5" />,
    'Swimming': <Waves className="h-5 w-5" />,
};


export default function ActivityPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activities, setActivities] = useState<Activity[]>([
        { type: 'Walk', duration: 45, time: '8:00 AM' },
        { type: 'Play', duration: 20, time: '1:00 PM' },
    ]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    const fetchRecommendations = async () => {
        if (profile) {
            setLoading(true);
            setError(null);
            const result = await getRecommendations({
                species: profile.species,
                breed: profile.breed,
                age: profile.age,
                healthGoal: profile.healthGoal,
            });

            if (result.success && result.data) {
                setRecommendations(result.data.recommendations);
            } else {
                setError(result.error || 'An unknown error occurred.');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [profile]);
    
    const handleLogActivity = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const type = formData.get('activity-type') as ActivityType;
        const duration = Number(formData.get('duration'));
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (type && duration > 0) {
            setActivities(prev => [...prev, { type, duration, time }]);
            setIsDialogOpen(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Pet Activity"
                description="Log and view your pet's daily activities."
            >
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                         <Button>
                            <Plus className="mr-2 h-4 w-4" /> Log New Activity
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log a New Activity</DialogTitle>
                            <DialogDescription>
                                Add a new activity you've completed with {profile?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleLogActivity} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Activity Type</Label>
                                <RadioGroup name="activity-type" defaultValue="Walk" className="grid grid-cols-3 gap-4">
                                   {Object.keys(activityIcons).map((activity) => (
                                        <Label key={activity} htmlFor={activity} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                            <RadioGroupItem value={activity} id={activity} className="sr-only" />
                                            {activityIcons[activity as ActivityType]}
                                            <span className="mt-2 text-sm font-medium">{activity}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input id="duration" name="duration" type="number" placeholder="e.g., 30" required />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Log Activity</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     <Card className="shadow-md">
                        <CardHeader className="flex-row items-start gap-4">
                            <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                            <div>
                                <CardTitle className="font-headline">Quick Recommendations</CardTitle>
                                <CardDescription>AI-powered suggestions to help {profile?.name} reach their goal.</CardDescription>
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
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            {!loading && !error && recommendations.length > 0 && (
                                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                    {recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Today's Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activities.length > 0 ? (
                                <ul className="space-y-4">
                                    {activities.map((activity, index) => (
                                        <li key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    {activityIcons[activity.type]}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{activity.type}</p>
                                                    <p className="text-sm text-muted-foreground">{activity.duration} min</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No activities logged yet today.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
