'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecommendations } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

const sampleSchedule = [
    { day: "Day 1", am: "30-min brisk walk", pm: "15-min fetch" },
    { day: "Day 2", am: "Puzzle feeder", pm: "20-min active play" },
    { day: "Day 3", am: "30-min sniffari", pm: "15-min training" },
    { day: "Day 4", am: "45-min park visit", pm: "10-min tug-of-war" },
    { day: "Day 5", am: "30-min walk", pm: "20-min fetch" },
    { day: "Day 6", am: "Long hike (60 mins)", pm: "Relaxed evening" },
    { day: "Day 7", am: "Gentle walk", pm: "Cuddle time" },
];

export default function ActivityPage() {
    const { profile } = usePetProfile();
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    
    const [showSchedule, setShowSchedule] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [scheduleStartDate, setScheduleStartDate] = useState<Date>();
    const [progress, setProgress] = useState(0);

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

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        setScheduleStartDate(date);
        setIsCalendarOpen(false);
        setShowSchedule(true);
        toast({
            title: "Schedule Generated!",
            description: `Your 7-day activity plan starting ${format(date, "PPP")} has been created.`,
        });
    };

    const getDayWithDate = (dayIndex: number) => {
        if (!scheduleStartDate) return sampleSchedule[dayIndex].day;
        const date = new Date(scheduleStartDate);
        date.setDate(scheduleStartDate.getDate() + dayIndex);
        return `${sampleSchedule[dayIndex].day} (${format(date, 'MMM d')})`;
    }


    useEffect(() => {
        if(profile) {
            fetchRecommendations();
        }
    }, [profile]);
    
    useEffect(() => {
        if (showSchedule && scheduleStartDate) {
            const today = new Date();
            const daysPassed = differenceInDays(today, scheduleStartDate);
            const currentProgress = Math.min(Math.max(daysPassed + 1, 0), 7);
            setProgress((currentProgress / 7) * 100);
        }
    }, [showSchedule, scheduleStartDate]);

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
                    <CardFooter>
                        <Button onClick={() => setIsCalendarOpen(true)}>Schedule Activities</Button>
                    </CardFooter>
                </Card>

                 <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Select a start date</DialogTitle>
                        <DialogDescription>
                            Choose the date you want your 7-day activity plan to begin.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={scheduleStartDate}
                                onSelect={handleDateSelect}
                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                initialFocus
                            />
                        </div>
                    </DialogContent>
                </Dialog>

                {showSchedule && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Your 7-Day Activity Plan</CardTitle>
                            <CardDescription>A week of engaging activities for {profile?.name} starting {scheduleStartDate && format(scheduleStartDate, 'PPP')}.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sampleSchedule.map((dayPlan, index) => (
                                <Card key={dayPlan.day} className="bg-muted/30">
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base font-semibold">{getDayWithDate(index)}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-sm space-y-2">
                                         <p><span className="font-semibold text-muted-foreground">AM:</span> {dayPlan.am}</p>
                                         <p><span className="font-semibold text-muted-foreground">PM:</span> {dayPlan.pm}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 pt-6">
                            <Label>Plan Progress</Label>
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
