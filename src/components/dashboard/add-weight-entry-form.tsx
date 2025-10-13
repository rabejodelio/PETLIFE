'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DocumentReference, DocumentData, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Scale } from 'lucide-react';
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

type AddWeightEntryFormProps = {
    petDocRef: DocumentReference<DocumentData> | null;
    currentWeight: number;
};

export function AddWeightEntryForm({ petDocRef, currentWeight }: AddWeightEntryFormProps) {
    const [weight, setWeight] = useState<number | string>(currentWeight);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!petDocRef || !weight) return;

        setIsLoading(true);
        try {
            const weightRecordsCol = collection(petDocRef, 'weightRecords');
            
            // Add new weight record
            addDocumentNonBlocking(weightRecordsCol, {
                weight: Number(weight),
                date: serverTimestamp(),
            });

            // Update the main pet profile with the new current weight
            updateDocumentNonBlocking(petDocRef, {
                weight: Number(weight),
            });
            
            toast({
                title: 'Weight Recorded!',
                description: `New weight of ${weight} kg has been saved.`,
            });
            
        } catch (error) {
            console.error('Error adding weight entry:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'Could not save the new weight entry.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-md h-full">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Log New Weight
                </CardTitle>
                <CardDescription>Enter your pet's current weight to track their progress.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="weight">Current Weight (kg)</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="e.g., 12.5"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Saving...' : 'Save Weight Entry'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
