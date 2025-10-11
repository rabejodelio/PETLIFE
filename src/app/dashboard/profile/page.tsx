'use client';

import { usePetProfile } from "@/hooks/use-pet-profile";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bone, Cat, Pencil, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


export default function ProfilePage() {
    const { profile, loading, saveProfile } = usePetProfile();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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


    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!profile) {
        return <div>No profile found. Please create one from the onboarding page.</div>;
    }

    return (
        <div>
             <PageHeader
                title="Pet Profile"
                description="View and manage your pet's details."
            >
                <Button variant="outline" asChild>
                    <Link href="/onboarding">
                        <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                    </Link>
                </Button>
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
