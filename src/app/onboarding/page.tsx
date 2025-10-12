'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { petProfileSchema } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type PetProfileFormValues = z.infer<typeof petProfileSchema>;

export default function OnboardingPage() {
  const { saveProfile, profile } = usePetProfile();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PetProfileFormValues>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: profile || {
      name: '',
      species: undefined,
      breed: '',
      age: 0,
      weight: 0,
      allergies: '',
      healthGoal: undefined,
      isPro: false,
    },
  });

  const onSubmit = (data: PetProfileFormValues) => {
    saveProfile({ ...data, isPro: false });
    toast({
      title: "Profile created!",
      description: "Let's get started on your pet's wellness journey.",
    })
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-2xl w-full">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Create Your Pet's Profile</CardTitle>
                <CardDescription>
                    Let's get to know your furry friend to personalize their experience.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pet's Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Jax" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="species"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Species</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex items-center space-x-4 pt-2"
                                            >
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <RadioGroupItem value="dog" id="dog" />
                                                    </FormControl>
                                                    <FormLabel htmlFor="dog" className="font-normal">Dog</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <RadioGroupItem value="cat" id="cat" />
                                                    </FormControl>
                                                    <FormLabel htmlFor="cat" className="font-normal">Cat</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="breed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Breed</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Golden Retriever" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age (years)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 3" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 12" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="healthGoal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primary Health Goal</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a goal" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="lose_weight">Lose Weight</SelectItem>
                                                <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                                                <SelectItem value="improve_joints">Improve Joint Health</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="allergies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Known Allergies (optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="e.g., Chicken, grain, certain pollens"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" className="w-full">Create Profile & View Plan</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
