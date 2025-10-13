'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { useCollection, WithId } from '@/firebase';
import { collection, query, orderBy, limit, DocumentReference, DocumentData } from 'firebase/firestore';
import { useMemo } from 'react';
import { useMemoFirebase } from '@/firebase/provider';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  weight: {
    label: 'Weight (kg)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface WeightRecord extends DocumentData {
    weight: number;
    date: {
        seconds: number;
        nanoseconds: number;
    } | Date;
}

type WeightChartProps = {
    petDocRef: DocumentReference<DocumentData> | null;
}

export function WeightChart({ petDocRef }: WeightChartProps) {
  const weightRecordsQuery = useMemoFirebase(() => {
    if (!petDocRef) return null;
    return query(collection(petDocRef, 'weightRecords'), orderBy('date', 'desc'), limit(12));
  }, [petDocRef]);

  const { data: weightRecords, isLoading } = useCollection<WeightRecord>(weightRecordsQuery);

  const chartData = useMemo(() => {
    if (!weightRecords) return [];
    return weightRecords
        .map(record => {
            const recordDate = record.date instanceof Date ? record.date : new Date(record.date.seconds * 1000);
            return {
                month: format(recordDate, 'MMM'),
                weight: record.weight,
            };
        })
        .reverse(); // Reverse to show oldest to newest
  }, [weightRecords]);

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="font-headline">Weight Trend</CardTitle>
        <CardDescription>Last 12 entries</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-64 w-full" />}
        {!isLoading && weightRecords && weightRecords.length > 0 && (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                 <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="weight" fill="var(--color-weight)" radius={4} />
              </BarChart>
            </ChartContainer>
        )}
        {!isLoading && (!weightRecords || weightRecords.length === 0) && (
            <div className="flex h-64 items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">
                    No weight history found. <br /> Add a new weight entry to start tracking.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
