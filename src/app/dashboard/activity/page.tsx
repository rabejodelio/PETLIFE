
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';


export default function ActivityPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <div>
            <PageHeader
                title="Activity Schedule"
                description="Plan and view your pet's activities."
            >
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Activity
                </Button>
            </PageHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                         <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                             <CardDescription>Click on a date to view or add activities.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>
                                {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                            </CardTitle>
                            <CardDescription>Activities for the selected date.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No activities scheduled for this day.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
