
'use client';

import { PageHeader } from '@/components/page-header';
import { useCollection } from '@/firebase';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, query } from 'firebase/firestore';
import type { UserDoc } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bone, Cat } from 'lucide-react';

export default function UsersPage() {
  const firestore = useFirestore();
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, isLoading, error } = useCollection<UserDoc>(usersQuery);

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
            {isLoading ? 'Loading users...' : `Showing ${users?.length || 0} users.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Email</TableHead>
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
                    Failed to load users: {error.message}.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.email}</span>
                    </div>
                  </TableCell>
                   <TableCell>{user.petName || 'N/A'}</TableCell>
                   <TableCell className='capitalize flex items-center gap-2'>
                       {user.petSpecies === 'dog' && <Bone className="h-4 w-4 text-muted-foreground" />}
                       {user.petSpecies === 'cat' && <Cat className="h-4 w-4 text-muted-foreground" />}
                       {user.petSpecies || 'N/A'}
                    </TableCell>
                   <TableCell>
                       <Badge variant={user.isPro ? 'default' : 'secondary'}>
                           {user.isPro ? 'Pro' : 'Free'}
                       </Badge>
                   </TableCell>
                </TableRow>
              ))}
              {!isLoading && users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    No users have signed up yet.
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
