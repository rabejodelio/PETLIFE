'use client';

import { PageHeader } from '@/components/page-header';
import { useCollection, WithId } from '@/firebase';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, collectionGroup, DocumentData, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PawPrint, Bone, Cat } from 'lucide-react';
import type { PetProfile } from '@/lib/types';
import { useMemo } from 'react';

// We get the full user object from Firestore which includes pet info
interface UserWithPet extends DocumentData {
    email: string;
    pet: WithId<PetProfile> | null;
}

export default function UsersPage() {
  const firestore = useFirestore();
  
  // Query to get all documents from the 'pets' subcollections across all users
  const petsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'pets'));
  }, [firestore]);

  const { data: pets, isLoading: petsLoading, error: petsError } = useCollection<PetProfile>(petsQuery);

  // This is a simple client-side join. For larger datasets, this should be handled by a backend.
  const usersWithPets = useMemo(() => {
    if (!pets) return [];
    
    // This is a simplified example. We derive user info from the pet's path.
    const userMap: Map<string, UserWithPet> = new Map();
    
    pets.forEach(pet => {
      // Path is like 'users/USER_ID/pets/PET_ID'
      const pathParts = (pet as any).__snapshot.ref.path.split('/');
      const userId = pathParts[1];
      
      // We don't have the user's email here directly. We'd normally need another query.
      // For this example, we'll just use a placeholder or the user ID.
      // In a real app, you would fetch user docs or denormalize the email onto the pet doc.
      if (!userMap.has(userId)) {
          userMap.set(userId, { 
              id: userId,
              email: `User ID: ${userId}`, // Placeholder
              pet: null 
          });
      }
      
      const user = userMap.get(userId)!;
      user.pet = pet; // Assuming one pet per user for simplicity
      user.email = 'User data not available'; // In a real app you'd fetch this
    });

    return Array.from(userMap.values());
  }, [pets]);

  const isLoading = petsLoading;
  const error = petsError;

  return (
    <div>
      <PageHeader
        title="Registered Users"
        description="Here is a list of all users and their pets."
      />

      <Card>
        <CardHeader>
          <CardTitle className='font-headline'>User List</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading users...' : `Showing ${usersWithPets?.length || 0} users.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Email / ID</TableHead>
                <TableHead>Pet Name</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Subscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                  </TableCell>
                   <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                   <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                   <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                </TableRow>
              ))}
              {error && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-destructive">
                    Failed to load users: {error.message}. <br/> Please ensure your Firestore security rules allow reading the 'pets' collection group.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && usersWithPets?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarFallback>{user.id.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.email}</span>
                    </div>
                  </TableCell>
                   <TableCell>{user.pet?.name || 'N/A'}</TableCell>
                   <TableCell className='capitalize flex items-center gap-2'>
                       {user.pet?.species === 'dog' && <Bone className="h-4 w-4 text-muted-foreground" />}
                       {user.pet?.species === 'cat' && <Cat className="h-4 w-4 text-muted-foreground" />}
                       {user.pet?.species || 'N/A'}
                    </TableCell>
                   <TableCell>
                       {user.pet ? (
                           <Badge variant={user.pet.isPro ? 'default' : 'secondary'}>
                               {user.pet.isPro ? 'Pro' : 'Free'}
                           </Badge>
                       ) : 'N/A'}
                   </TableCell>
                </TableRow>
              ))}
              {!isLoading && usersWithPets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    No pet profiles have been created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
