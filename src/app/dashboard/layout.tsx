
'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import type { PetProfile, ActivityHistory } from '@/lib/types';
import { PetProfileContext } from '@/hooks/use-pet-provider';


const PRO_CODE = "petlife7296";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, loading, clearProfile, clearActivityHistory, saveProfile } = React.useContext(PetProfileContext)!;
  const { toast } = useToast();
  const [isProDialogOpen, setIsProDialogOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const { user, isUserLoading } = useUser();
  const auth = useAuth();


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleProSuccess = () => {
    if (profile && !profile.isPro) {
      saveProfile({ isPro: true });
       toast({
        title: 'Félicitations !',
        description: "Vous êtes maintenant un membre Pro.",
      });
    }
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
    clearProfile();
    clearActivityHistory();
    router.push('/');
  };

  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === PRO_CODE.toLowerCase()) {
      if (profile) {
        saveProfile({ isPro: true });
        toast({
          title: 'Félicitations !',
          description: "Vous êtes maintenant un membre Pro.",
        });
        setIsProDialogOpen(false);
        setPromoCode('');
      }
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
    { href: '/dashboard/meal-plan', label: 'Meal Plan', icon: Salad, pro: false },
    { href: '/dashboard/supplements', label: 'Supplements', icon: Pill, pro: true },
    { href: '/dashboard/activity', label: 'Activity', icon: PawPrint, pro: true },
    { href: '/dashboard/wellness', label: 'Wellness', icon: Heart, pro: true },
    { href: '/dashboard/profile', label: 'Profile', icon: User, pro: false },
    { href: '/dashboard/users', label: 'Users', icon: Users, pro: false, admin: true },
  ];

  if (isUserLoading || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo />
      </div>
    );
  }

  // A simple check for an admin user. In a real app, this should be based on custom claims.
  const isAdmin = user?.email === 'admin@petlife.com';

  return (
    <SidebarProvider>
      <ProSubscriptionDialog open={isProDialogOpen} onOpenChange={setIsProDialogOpen} />
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between">
              <Logo />
              <SidebarTrigger />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.filter(item => !(item.admin && !isAdmin)).map((item) => {
              const isPro = profile?.isPro ?? false;
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
             {!profile?.isPro && (
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
                                <Button type="button" variant="secondary" onClick={handlePromoCode} className="h-9">Appliquer</Button>
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
              {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile?.name} />}
              <AvatarFallback>
                {profile?.species === 'dog' ? <Bone/> : <Cat/>}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
              <div className='flex items-center gap-2'>
                <p className="font-semibold truncate">{profile?.name || user?.email}</p>
                {profile?.isPro && <span className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{profile?.breed || 'No pet profile'}</p>
            </div>
          </div>
          <Button variant="ghost" className="justify-start w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
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
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>({});
  
  const getActivityHistoryKey = (userId: string) => `petlife-activity-history-${userId}`;

  useEffect(() => {
    if (isUserLoading) {
      setLoading(true);
      return;
    }
    if (!user || !firestore) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const petDocRef = doc(firestore, 'users', user.uid, 'pets', 'main-pet');
    setLoading(true);

    const unsubscribe = onSnapshot(petDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as PetProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erreur de chargement du profil depuis Firestore :", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, isUserLoading]);

  useEffect(() => {
    if (user) {
      const key = getActivityHistoryKey(user.uid);
      try {
        const storedHistory = localStorage.getItem(key);
        setActivityHistory(storedHistory ? JSON.parse(storedHistory) : {});
      } catch (e) {
        console.error("Impossible de lire l'historique d'activité :", e);
        setActivityHistory({});
      }
    } else {
      setActivityHistory({});
    }
  }, [user]);

  const saveProfile = (newProfileData: Partial<PetProfile>) => {
    if (!user || !firestore) {
      console.error("Sauvegarde impossible : utilisateur non connecté.");
      return;
    }

    // Construct the full updated profile object first
    const updatedProfile: PetProfile = {
      ...(profile || {
        name: '', species: 'dog', breed: '', age: 0, weight: 0,
        healthGoal: 'maintain_weight', isPro: false,
      }),
      ...newProfileData
    };
    
    // Optimistically update the local state immediately.
    // This makes the UI feel instant and prevents race conditions with onSnapshot.
    setProfile(updatedProfile);

    // Now, persist the changes to Firestore in the background.
    const userDocRef = doc(firestore, 'users', user.uid);
    const petDocRef = doc(userDocRef, 'pets', 'main-pet');

    const denormalizedData: { petName: string; petSpecies: 'dog' | 'cat'; isPro: boolean; email?: string } = {
      petName: updatedProfile.name,
      petSpecies: updatedProfile.species,
      isPro: updatedProfile.isPro
    };
    if (user.email) {
      denormalizedData.email = user.email;
    }

    // Use promises to write to both documents
    const petPromise = setDoc(petDocRef, updatedProfile, { merge: true });
    const userPromise = setDoc(userDocRef, denormalizedData, { merge: true });
    
    // We don't need to await them here as the UI is already updated.
    // We can add .catch() for error handling if needed.
    Promise.all([petPromise, userPromise]).catch(error => {
      console.error("Failed to save profile to Firestore:", error);
      // Optional: revert the optimistic update on failure by re-fetching or setting back to the previous profile.
      // For this app, we'll log the error and let the next onSnapshot eventually correct it.
    });
  };

  const clearProfile = () => setProfile(null);

  const saveActivityHistory = (newHistory: ActivityHistory) => {
    if (user) {
      setActivityHistory(newHistory);
      localStorage.setItem(getActivityHistoryKey(user.uid), JSON.stringify(newHistory));
    }
  };

  const clearActivityHistory = () => {
    if (user) {
      setActivityHistory({});
      localStorage.removeItem(getActivityHistoryKey(user.uid));
    }
  };
  
  useEffect(() => {
    if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (!docSnap.exists() && user.email) {
                setDoc(userDocRef, { email: user.email }, { merge: true });
            }
        });
    }
  }, [user, firestore]);

  const contextValue = {
    profile,
    loading: loading || isUserLoading,
    activityHistory,
    saveProfile,
    clearProfile,
    setActivityHistory: saveActivityHistory,
    clearActivityHistory,
  };

  return (
    <PetProfileContext.Provider value={contextValue}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </PetProfileContext.Provider>
  )
}

    