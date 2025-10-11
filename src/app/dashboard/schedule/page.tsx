import { PageHeader } from '@/components/page-header';

export default function SchedulePage() {
    return (
        <div>
            <PageHeader
                title="Activity Schedule"
                description="Plan and view your pet's weekly activities."
            />
            <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Calendar coming soon!</p>
            </div>
        </div>
    );
}
