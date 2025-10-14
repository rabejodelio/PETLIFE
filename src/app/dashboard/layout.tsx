
'use client';

import React, { useEffect, useState } from 'react';
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
import { useAuth, useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import type { UserDoc } from '@/lib/types';


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
    { href: '/dashboard/meal-plan', label: 'Meal Plan', icon: Salad, pro: false },
    { href: '/dashboard/supplements', label: 'Supplements', icon: Pill, pro: true },
    { href: '/dashboard/activity', label: 'Activity', icon: PawPrint, pro: true },
    { href: '/dashboard/wellness', label: 'Wellness', icon: Heart, pro: true },
    { href: '/dashboard/users', label: 'Users', icon: Users, pro: false, admin: true },
  ];

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
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    if (!user || !firestore) {
      return;
    }
    
    const userDocRef = doc(firestore, 'users', user.uid);

    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setUserDoc(docSnap.data() as UserDoc);
        } else if (user.email) {
            const newUserDoc: UserDoc = { email: user.email, isPro: false };
            setDoc(userDocRef, newUserDoc); // Create user doc if it doesn't exist
            setUserDoc(newUserDoc);
        }
    }, (error) => {
        console.error("Error loading user document from Firestore:", error);
    });

    return () => {
      unsubUser();
    };
  }, [user, firestore, isUserLoading]);

  const handlePromoCode = async (): Promise<void> => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non authentifié.' });
        return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const dataToUpdate = { isPro: true };

    updateDoc(userDocRef, dataToUpdate)
        .then(() => {
            // The onSnapshot listener for the user doc will update the state
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

  const isPro = userDoc?.isPro || false;

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo />
      </div>
    );
  }

  return (
      <DashboardLayoutContent
        handlePromoCode={handlePromoCode}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        isPro={isPro}
      >
        {children}
      </DashboardLayoutContent>
  );
}
