'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { usePetProfile } from '@/hooks/use-pet-provider';
import { petProfileSchema } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { PageHeader } from '@/components/page-header';

type PetProfileFormValues = z.infer<typeof petProfileSchema>;

export default function EditProfilePage() {
  const { saveProfile, profile, loading } = usePetProfile();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<PetProfileFormValues>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: profile || {
      name: '',
      species: 'dog',
      breed: '',
      age: 0,
      weight: 0,
      allergies: '',
      healthGoal: 'maintain_weight',
    },
  });

   useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Reset the form with the current profile data when it loads
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  const onSubmit = async (data: PetProfileFormValues) => {
    try {
        await saveProfile(data);
        toast({
        title: "Profile saved!",
        description: "Your pet's information has been updated.",
        });
        router.push('/dashboard/profile');
    } catch(error) {
        console.error("Failed to save profile:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the pet profile. Please try again.",
        })
    }
  };

  if (isUserLoading || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <PageHeader 
            title={profile ? "Edit Pet Profile" : "Create Pet Profile"}
            description={profile ? "Update your pet's details below." : "Let's get to know your furry friend to personalize their experience."}
        />
        <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
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
                                                value={field.value}
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
                                                <Input type="number" placeholder="e.g., 3" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                                                <Input type="number" placeholder="e.g., 12" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
