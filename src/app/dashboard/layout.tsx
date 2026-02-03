'use client';

import React, { useEffect, useState, createContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Salad,
  Pill,
  PawPrint,
  Heart,
  User,
  LogOut,
  Bone,
  Cat,
  Home,
  Sparkles,
  Lock,
  Users,
  Pencil,
  TrendingUp,
  BrainCircuit,
  FlaskConical,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import { ProSubscriptionDialog } from '@/components/pro-subscription-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { UserDoc, PetProfile } from '@/lib/types';
import { PetProfileContext } from '@/hooks/use-pet-provider';


const PRO_CODE = "petlife7296";

function DashboardLayoutContent({ 
  children,
  handlePromoCode,
  promoCode,
  setPromoCode,
  isPro,
}: { 
  children: React.ReactNode;
  handlePromoCode: () => Promise<void>;
  promoCode: string;
  setPromoCode: (code: string) => void;
  isPro: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isProDialogOpen, setIsProDialogOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleProSuccess = async () => {
    // This function can be updated to set a user's pro status in Firestore
    toast({
      title: 'Félicitations !',
      description: "Vous êtes maintenant un membre Pro.",
    });
  };

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
        handleProSuccess();
        router.replace('/dashboard');
    } else if (paymentStatus === 'cancel') {
        toast({
            variant: 'destructive',
            title: 'Paiement annulé',
            description: 'Votre transaction a été annulée.',
        });
        router.replace('/dashboard');
    }
  }, [searchParams, router]);


  const handleLogout = () => {
    signOut(auth);
    router.push('/');
  };

  const onApplyPromoCode = async () => {
    if (promoCode.toLowerCase() === PRO_CODE.toLowerCase()) {
      await handlePromoCode();
      setIsProDialogOpen(false);
      setPromoCode('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Code invalide',
        description: 'Le code que vous avez entré n\'est pas valide.',
      });
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home, pro: false },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, pro: false },
    { href: '/dashboard/profile', label: 'Pet Profile', icon: User, pro: false },
    { href: '/dashboard/meal-plan', label: 'Meal Plan', icon: Salad, pro: false },
    { href: '/dashboard/supplements', label: 'Supplements', icon: Pill, pro: true },
    { href: '/dashboard/wellness', label: 'Wellness', icon: Heart, pro: true },
    { href: '/dashboard/longevity-score', label: 'Score de Longévité', icon: TrendingUp, pro: true },
    { href: '/dashboard/cognitive-aging', label: 'Cognitive Aging', icon: BrainCircuit, pro: true },
    { href: '/dashboard/nutrition-analysis', label: 'Nutrition Analysis', icon: FlaskConical, pro: true },
    { href: '/dashboard/enrichment-plan', label: 'Enrichment Plan', icon: Wind, pro: true },
    { href: '/dashboard/prevention-assistant', label: 'Prevention', icon: ShieldCheck, pro: true },
    { href: '/dashboard/users', label: 'Users', icon: Users, pro: false, admin: true },
  ];

  // A simple check for an admin user. In a real app, this should be based on custom claims.
  const isAdmin = user?.email === 'admin@petlife.com';

  return (
    <SidebarProvider>
      <ProSubscriptionDialog open={isProDialogOpen} onOpenChange={setIsProDialogOpen} />
      <Sidebar>
        <SidebarHeader className="hidden md:flex">
            <div className="flex items-center justify-between">
              <Logo />
              <SidebarTrigger />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.filter(item => !(item.admin && !isAdmin)).map((item) => {
              const isLocked = item.pro && !isPro;
              
              const linkContent = (
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                      setIsProDialogOpen(true);
                    }
                  }}
                >
                  {isLocked ? <Lock /> : <item.icon />}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              );

              return (
                <SidebarMenuItem key={item.href}>
                  {isLocked ? (
                    <div className="w-full cursor-pointer">{linkContent}</div>
                  ) : (
                    <Link href={item.href}>{linkContent}</Link>
                  )}
                </SidebarMenuItem>
              );
            })}
             {!isPro && (
                <SidebarGroup className="p-0 mt-4 space-y-2">
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setIsProDialogOpen(true)} variant="outline" className="w-full justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none hover:from-yellow-500 hover:to-orange-600 hover:text-white">
                            <Sparkles />
                            <span>Passer Pro</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className='px-2'>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-sidebar px-2 text-muted-foreground">
                                OU
                                </span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem className='px-2'>
                        <div className='flex flex-col space-y-2'>
                            <Label htmlFor="promo-code" className='text-left text-xs px-1 text-muted-foreground'>Code promotionnel</Label>
                            <div className='flex gap-2 w-full'>
                                <Input id="promo-code" placeholder="Entrez votre code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-grow bg-background/50 h-9" />
                                <Button type="button" variant="secondary" onClick={onApplyPromoCode} className="h-9">Appliquer</Button>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarGroup>
              )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
              <div className='flex items-center gap-2'>
                <p className="font-semibold truncate">{user?.email}</p>
                {isPro && <span className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">User</p>
            </div>
          </div>
          <Button variant="ghost" className="justify-start w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="md:hidden flex items-center justify-between p-4 border-b">
            <Logo />
            <SidebarTrigger />
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
            {user ? children : <div>Loading...</div>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
        router.push('/login');
        return;
    }
    if (!firestore) return;

    // Listener for the user document (for isPro status)
    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, async (userDocSnap) => {
        if (userDocSnap.exists()) {
            const userDocData = userDocSnap.data() as UserDoc;
            setIsPro(userDocData.isPro || false);
        } else {
            // If user doc doesn't exist, create it.
            await setDoc(userDocRef, { email: user.email!, isPro: false });
            setIsPro(false);
        }
    }, (error) => {
        console.error("Error subscribing to user document:", error);
        setIsPro(false);
    });

    // Listener for the pet profile document
    const petDocRef = doc(firestore, 'users', user.uid, 'pets', 'main-pet');
    const unsubPet = onSnapshot(petDocRef, (petDocSnap) => {
        if (petDocSnap.exists()) {
            setPetProfile(petDocSnap.data() as PetProfile);
        } else {
            setPetProfile(null);
        }
        setLoading(false); // Combined loading is finished when pet profile is loaded/checked
    }, (error) => {
        console.error("Error subscribing to pet profile:", error);
        setPetProfile(null);
        setLoading(false);
    });

    return () => {
      unsubUser();
      unsubPet();
    };
  }, [user, firestore, isUserLoading, router]);

  const saveProfile = async (newProfileData: Partial<PetProfile>): Promise<void> => {
    if (!user || !firestore) {
      throw new Error("User not authenticated or Firestore not available.");
    }
    
    const currentProfile: PetProfile = petProfile || {
      name: '',
      species: 'dog',
      sex: 'female',
      sterilized: false,
      breed: '',
      age: 0,
      weight: 0,
      healthGoal: 'maintain_weight',
      isPro: isPro,
      avatarUrl: '',
      allergies: '',
    };
  
    const updatedProfile = { ...currentProfile, ...newProfileData, isPro: isPro };
  
    try {
      const petDocRef = doc(firestore, 'users', user.uid, 'pets', 'main-pet');
      await setDoc(petDocRef, updatedProfile, { merge: true });
      // The onSnapshot listener will automatically update the state, so optimistic update is optional
      // but can make the UI feel faster.
      setPetProfile(updatedProfile); 
    } catch (error) {
      console.error("Firestore write failed:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the pet profile to the database.",
      });
      throw error; 
    }
  };


  const clearProfile = () => setPetProfile(null);

  const petProfileContextValue = {
    profile: petProfile,
    loading: isUserLoading || loading,
    saveProfile,
    clearProfile,
  };

  const handlePromoCode = async (): Promise<void> => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non authentifié.' });
        return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const dataToUpdate = { isPro: true };

    updateDoc(userDocRef, dataToUpdate)
        .then(() => {
            toast({
                title: 'Félicitations !',
                description: "Vous êtes maintenant un membre Pro.",
            });
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: dataToUpdate,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  if (isUserLoading || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo />
      </div>
    );
  }

  return (
    <PetProfileContext.Provider value={petProfileContextValue}>
      <DashboardLayoutContent
        handlePromoCode={handlePromoCode}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        isPro={isPro}
      >
        {children}
      </DashboardLayoutContent>
    </PetProfileContext.Provider>
  );
}
