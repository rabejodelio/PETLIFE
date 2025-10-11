
'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Footprints, Plus, Lightbulb, Activity as ActivityIcon, Dumbbell, ToyBrick, Wind, Disc, Mountain, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const initialActivities = [
  { type: 'Walk', duration: 45, time: '8:00 AM' },
  { type: 'Play', duration: 20, time: '1:00 PM' },
  { type: 'Walk', duration: 30, time: '6:00 PM' },
];

const activitySchema = z.object({
  type: z.string().min(1, 'Activity type is required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
});

type ActivityFormValues = z.infer<typeof activitySchema>;
type Activity = { type: string; duration: number; time: string };

const activityIcons: { [key: string]: React.ReactNode } = {
    'Walk': <Footprints className="w-5 h-5" />,
    'Run': <Wind className="w-5 h-5" />,
    'Play': <ToyBrick className="w-5 h-5" />,
    'Training': <Dumbbell className="w-5 h-5" />,
    'Fetch': <Disc className="w-5 h-5" />,
    'Hike': <Mountain className="w-5 h-5" />,
    'Swimming': <Waves className="w-5 h-5" />,
    'Default': <ActivityIcon className="w-5 h-5" />,
};


export default function ActivityPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            type: '',
            duration: 15,
        },
    });

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
    
    const onSubmit = (data: ActivityFormValues) => {
        const newActivity: Activity = {
            ...data,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        };
        setActivities(prev => [newActivity, ...prev]);
        form.reset();
        setIsDialogOpen(false);
    };

    return (
        <div>
            <PageHeader
                title="Activity Tracking"
                description={`Monitor and log ${profile?.name}'s daily exercise.`}
            >
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Log New Activity
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Log New Activity</DialogTitle>
                            <DialogDescription>
                                Add a new exercise session for {profile?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                             <Label>Activity Type</Label>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an activity type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Walk">Walk</SelectItem>
                                                    <SelectItem value="Run">Run</SelectItem>
                                                    <SelectItem value="Play">Play</SelectItem>
                                                    <SelectItem value="Training">Training</SelectItem>
                                                    <SelectItem value="Fetch">Fetch</SelectItem>
                                                    <SelectItem value="Hike">Hike</SelectItem>
                                                    <SelectItem value="Swimming">Swimming</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Duration (minutes)</Label>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <DialogFooter>
                                    <Button type="submit">Log Activity</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </PageHeader>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     <Card>
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
                                <ul className="space-y-3 text-sm">
                                    {recommendations.map((rec, i) => (
                                        <li key={i} className="flex items-start justify-between p-2 rounded-md hover:bg-muted/50">
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Today's Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {activities.length > 0 ? (
                                <ul className="space-y-4">
                                {activities.map((activity, index) => (
                                    <li key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                {activityIcons[activity.type] || activityIcons['Default']}
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
