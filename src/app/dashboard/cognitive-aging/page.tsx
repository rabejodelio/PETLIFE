'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePetProfile } from '@/hooks/use-pet-provider';
import Link from 'next/link';
import { Pencil, Sparkles, BrainCircuit, FileText } from 'lucide-react';
import { generateProgramAction } from './actions';
import type { CognitiveStimulationOutput } from '@/ai/flows/ai-cognitive-stimulation';
import ReactMarkdown from 'react-markdown';

const seniorChecklist = {
  signs: [
    "Disorientation in the house",
    "Changes in sleep/wake cycle",
    "Decreased social interaction",
    "Forgetting basic commands"
  ]
};

export default function CognitiveAgingPage() {
    const { profile, loading: profileLoading } = usePetProfile();
    const [checkedState, setCheckedState] = useState(
        new Array(seniorChecklist.signs.length).fill(false)
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [program, setProgram] = useState<CognitiveStimulationOutput | null>(null);

    const handleOnChange = (position: number) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
        setCheckedState(updatedCheckedState);
    };

    const score = checkedState.filter(Boolean).length;

    const handleGenerateProgram = async () => {
        if (!profile) return;
        setIsGenerating(true);
        setError(null);
        setProgram(null);

        const observedSigns = seniorChecklist.signs.filter((_, index) => checkedState[index]);

        try {
            const result = await generateProgramAction({
                species: profile.species,
                age: profile.age,
                observedSigns,
            });
            if (result.success && result.data) {
                setProgram(result.data);
            } else {
                setError(result.error || "An unknown error occurred.");
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate program.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (profileLoading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (!profile) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold">No Pet Profile Found</h2>
                <p className="text-muted-foreground mt-2 mb-4">Create a pet profile to use this feature.</p>
                <Button asChild>
                    <Link href="/dashboard/profile/edit">
                        <Pencil className="mr-2 h-4 w-4" /> Create Profile
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Cognitive Aging Sign Detector"
                description="Assess the signs of cognitive aging in your pet."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5" />
                                Signs Checklist
                            </CardTitle>
                             <CardDescription>Check the signs you observe in your pet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {seniorChecklist.signs.map((sign, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`sign-${index}`}
                                            checked={checkedState[index]}
                                            onCheckedChange={() => handleOnChange(index)}
                                        />
                                        <Label htmlFor={`sign-${index}`} className="text-sm font-normal">
                                            {sign}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                             {score > 0 && (
                                <Button onClick={handleGenerateProgram} disabled={isGenerating} className="w-full mt-4">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {isGenerating ? 'Generating...' : 'simulation program'}
                                </Button>
                             )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="min-h-[20rem]">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Cognitive Stimulation Program
                            </CardTitle>
                            <CardDescription>
                                A program of activities to keep your pet's mind sharp.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isGenerating && (
                                <div className="space-y-3 pt-4">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-5 w-5/6" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                             )}
                             {error && (
                                <p className="text-destructive pt-4">{error}</p>
                             )}
                             {program && !isGenerating && (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{program.program}</ReactMarkdown>
                                </div>
                             )}
                             {!program && !isGenerating && !error && (
                                <p className="text-sm text-muted-foreground text-center pt-10">
                                    Check at least one sign to generate a personalized program.
                                </p>
                             )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
