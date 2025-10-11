'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';
import type { ActivityHistory } from '@/lib/types';
import { useMemo } from 'react';

const chartConfig = {
    minutes: {
        label: 'Activity (minutes)',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

type ActivityChartProps = {
    activityHistory: ActivityHistory;
};

export function ActivityChart({ activityHistory }: ActivityChartProps) {
    const chartData = useMemo(() => {
        const today = new Date();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayActivities = activityHistory[dateKey] || [];
            const totalMinutes = dayActivities
                .filter(activity => activity.completed)
                .reduce((sum, activity) => sum + activity.duration, 0);

            data.push({
                day: format(date, 'E'), // e.g., "Mon", "Tue"
                minutes: totalMinutes,
            });
        }
        return data;
    }, [activityHistory]);


    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline">Weekly Activity</CardTitle>
                <CardDescription>Your goal is 60 minutes per day.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                         />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <defs>
                            <linearGradient id="fillMinutes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-minutes)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-minutes)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="minutes"
                            type="natural"
                            fill="url(#fillMinutes)"
                            stroke="var(--color-minutes)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
