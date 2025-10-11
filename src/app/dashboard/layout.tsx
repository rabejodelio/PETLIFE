
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  Calendar,
  Sparkles,
  Lock,
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePetProfile } from '@/hooks/use-pet-profile';
import { Logo } from '@/components/logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { ProSubscriptionDialog } from '@/components/pro-subscription-dialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, clearProfile, clearActivityHistory, saveProfile } = usePetProfile();
  const router = useRouter();
  const [isProDialogOpen, setIsProDialogOpen] = useState(false);


  useEffect(() => {
    if (!loading && !profile) {
      router.push('/onboarding');
    }
  }, [loading, profile, router]);

  const handleLogout = () => {
    clearProfile();
    clearActivityHistory();
    router.push('/');
  };
  
   const handleProSuccess = () => {
    if (profile) {
      saveProfile({ ...profile, isPro: true });
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
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ProSubscriptionDialog open={isProDialogOpen} onOpenChange={setIsProDialogOpen} onProSuccess={handleProSuccess}/>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between">
              <Logo />
              <SidebarTrigger />
            </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => {
              const isPro = profile?.isPro ?? false;
              const isLocked = item.pro && !isPro;
              const linkContent = (
                <SidebarMenuButton
                  isActive={pathname === item.href && !isLocked}
                  tooltip={item.label}
                  disabled={isLocked}
                  onClick={isLocked ? () => setIsProDialogOpen(true) : undefined}
                >
                  {isLocked ? <Lock /> : <item.icon />}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              );

              return (
                <SidebarMenuItem key={item.href}>
                  {isLocked ? (
                    <div>{linkContent}</div>
                  ) : (
                    <Link href={item.href}>{linkContent}</Link>
                  )}
                </SidebarMenuItem>
              );
            })}
             {!profile?.isPro && (
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsProDialogOpen(true)} variant="outline" className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none hover:from-yellow-500 hover:to-orange-600 hover:text-white">
                    <Sparkles />
                    <span>Passer Pro</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
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
                <p className="font-semibold truncate">{profile?.name}</p>
                {profile?.isPro && <span className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{profile?.breed}</p>
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
            {profile ? children : <div>Loading profile...</div>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
