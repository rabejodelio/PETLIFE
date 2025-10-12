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
import { useUser, useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';

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
  const { profile, loading: profileLoading } = usePetProfile();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function onSubmit(data: PetProfile) {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Vous devez être connecté pour créer un profil.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
        const petsCollectionRef = collection(firestore, 'users', user.uid, 'pets');
        // Set isPro to true to unlock features
        const finalData = { ...data, isPro: true, avatarUrl: data.avatarUrl || '' };
        
        // Wait for the document to be added to Firestore
        await addDoc(petsCollectionRef, finalData);

        toast({
            title: "Profil créé !",
            description: `Bienvenue, ${data.name} ! C'est parti.`,
        });
        
        // Redirect only after successful save
        router.push('/dashboard');

    } catch (error) {
        console.error("Failed to create profile:", error);
        toast({
            variant: "destructive",
            title: "Erreur de création du profil",
            description: "Une erreur s'est produite. Veuillez réessayer.",
        });
    } finally {
      setIsSubmitting(false);
    }
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
            <CardTitle className="font-headline text-3xl">Parlez-nous de votre animal</CardTitle>
            <CardDescription>Cela nous aide à créer un plan personnalisé pour votre compagnon. Nous avons pré-rempli des données pour un animal d'exemple nommé Jax.</CardDescription>
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
                        <FormLabel>Nom de l'animal</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Jax" {...field} />
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
                        <FormLabel>Espèce</FormLabel>
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
                                <Bone className="h-5 w-5" /> Chien
                              </Label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="cat" id="cat" />
                              </FormControl>
                              <Label htmlFor="cat" className="flex items-center gap-2 font-normal">
                                <Cat className="h-5 w-5" /> Chat
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
                          <FormLabel>Race</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: Beagle" {...field} />
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
                          <FormLabel>Âge (années)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="ex: 4" {...field} />
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
                          <FormLabel>Poids (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="ex: 15" {...field} />
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
                      <FormLabel>Objectif de santé principal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un objectif" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lose_weight">Perdre du poids</SelectItem>
                          <SelectItem value="maintain_weight">Maintenir le poids</SelectItem>
                          <SelectItem value="improve_joints">Améliorer les articulations</SelectItem>
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
                      <FormLabel>Allergies connues</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Listez les allergies connues, ex: Poulet, céréales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Création du profil..." : "Créer le profil & Voir le plan"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
