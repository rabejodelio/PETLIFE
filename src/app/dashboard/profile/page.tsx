'use client';

import { usePetProfile } from "@/hooks/use-pet-profile";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bone, Cat, Pencil, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { petProfileSchema } from '@/lib/schemas';
import type { PetProfile } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function EditProfileForm({ profile, onSave, onCancel }: { profile: PetProfile, onSave: (data: PetProfile) => void, onCancel: () => void }) {
    const form = useForm<PetProfile>({
        resolver: zodResolver(petProfileSchema),
        defaultValues: profile,
    });

    function onSubmit(data: PetProfile) {
        onSave(data);
    }

    return (
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
                                                <RadioGroupItem value="dog" id="dog-edit" />
                                            </FormControl>
                                            <Label htmlFor="dog-edit" className="flex items-center gap-2 font-normal">
                                                <Bone className="h-5 w-5" /> Dog
                                            </Label>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="cat" id="cat-edit" />
                                            </FormControl>
                                            <Label htmlFor="cat-edit" className="flex items-center gap-2 font-normal">
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
                                    <Input type="number" placeholder="e.g., 4" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
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
                                    <Input type="number" step="0.1" placeholder="e.g., 15" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </Form>
    );
}


export default function ProfilePage() {
    const { profile, loading, saveProfile } = usePetProfile();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        if (!isEditDialogOpen) {
            // Potentially refresh data or handle other state resets when dialog closes
        }
    }, [isEditDialogOpen]);

    const healthGoalMap = {
        lose_weight: 'Lose Weight',
        maintain_weight: 'Maintain Weight',
        improve_joints: 'Improve Joints',
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && profile) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: "Please select an image smaller than 2MB.",
                });
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                saveProfile({ ...profile, avatarUrl: imageUrl });
                toast({
                    title: "Profile picture updated!",
                    description: "Your pet's new photo has been saved.",
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = (data: PetProfile) => {
        saveProfile(data);
        toast({
            title: "Profile Updated!",
            description: "Your pet's information has been saved.",
        });
        setIsEditDialogOpen(false);
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!profile) {
        return <div>No profile found.</div>;
    }

    return (
        <div>
             <PageHeader
                title="Pet Profile"
                description="View and manage your pet's details."
            >
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Edit Pet Profile</DialogTitle>
                            <DialogDescription>
                                Make changes to {profile.name}'s profile here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <EditProfileForm
                            profile={profile}
                            onSave={handleSaveProfile}
                            onCancel={() => setIsEditDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center gap-6">
                     <div className="relative group">
                        <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                            <AvatarFallback>
                                {profile.species === 'dog' ? <Bone className="h-10 w-10"/> : <Cat className="h-10 w-10"/>}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                             <Camera className="h-8 w-8 text-white" />
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div>
                        <CardTitle className="font-headline text-3xl">{profile.name}</CardTitle>
                        <CardDescription className="text-base">{profile.breed}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm mt-4">
                        <div className="space-y-1">
                            <h4 className="font-semibold text-muted-foreground">Species</h4>
                            <p className="capitalize">{profile.species}</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-semibold text-muted-foreground">Age</h4>
                            <p>{profile.age} years</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-semibold text-muted-foreground">Weight</h4>
                            <p>{profile.weight} kg</p>
                        </div>
                        <div className="space-y-1 col-span-2 md:col-span-1">
                            <h4 className="font-semibold text-muted-foreground">Health Goal</h4>
                            <p>{healthGoalMap[profile.healthGoal]}</p>
                        </div>
                         <div className="space-y-1 col-span-2">
                            <h4 className="font-semibold text-muted-foreground">Allergies</h4>
                            <p>{profile.allergies || 'None specified'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
