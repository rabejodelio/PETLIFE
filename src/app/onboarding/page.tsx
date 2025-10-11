'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bone, Cat } from 'lucide-react';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { petProfileSchema } from '@/lib/schemas';
import type { PetProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

// Pre-filled data for "Jax" as requested
const jaxData: Omit<PetProfile, 'isPro' | 'avatarUrl'> = {
  name: 'Jax',
  species: 'dog',
  breed: 'Beagle',
  age: 4,
  weight: 15,
  allergies: 'Chicken',
  healthGoal: 'lose_weight',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { saveProfile, profile, loading: profileLoading } = usePetProfile();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const form = useForm<PetProfile>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: profile || {
      ...jaxData,
      isPro: false,
      avatarUrl: '',
    },
  });
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if(profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  function onSubmit(data: PetProfile) {
    saveProfile(data);
    toast({
      title: "Profile Created!",
      description: `Welcome, ${data.name}! Let's get started.`,
    });
    router.push('/dashboard');
  }
  
  if (isUserLoading || profileLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Logo />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex justify-center">
           <Logo />
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Tell us about your pet</CardTitle>
            <CardDescription>This helps us create a personalized plan for your companion. We've pre-filled some data for an example pet named Jax.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                      <FormItem className="space-y-3">
                        <FormLabel>Species</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="dog" id="dog" />
                              </FormControl>
                              <Label htmlFor="dog" className="flex items-center gap-2 font-normal">
                                <Bone className="h-5 w-5" /> Dog
                              </Label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="cat" id="cat" />
                              </FormControl>
                              <Label htmlFor="cat" className="flex items-center gap-2 font-normal">
                                <Cat className="h-5 w-5" /> Cat
                              </Label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Beagle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (years)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 4" {...field} />
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
                            <Input type="number" step="0.1" placeholder="e.g., 15" {...field} />
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
                      <FormLabel>Main Health Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lose_weight">Lose Weight</SelectItem>
                          <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                          <SelectItem value="improve_joints">Improve Joints</SelectItem>
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
                      <FormLabel>Known Allergies</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List any known allergies, e.g., Chicken, grains" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full">Create Profile &amp; View Plan</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
