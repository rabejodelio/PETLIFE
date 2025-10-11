
'use client';

import { usePetProfile } from "@/hooks/use-pet-profile";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Bone, Cat, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ProfilePage() {
    const { profile, loading } = usePetProfile();
    const router = useRouter();
    const petAvatar = PlaceHolderImages.find((img) => img.id === 'pet-avatar');

    const healthGoalMap = {
        lose_weight: 'Lose Weight',
        maintain_weight: 'Maintain Weight',
        improve_joints: 'Improve Joints',
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
                <Button variant="outline" onClick={() => router.push('/onboarding')}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </PageHeader>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20">
                        {petAvatar && <AvatarImage src={petAvatar.imageUrl} alt={profile.name} />}
                        <AvatarFallback>
                            {profile.species === 'dog' ? <Bone/> : <Cat/>}
                        </AvatarFallback>
                    </Avatar>
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
