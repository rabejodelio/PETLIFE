'use client';

import { PageHeader } from '@/components/page-header';
import { useCollection } from '@/firebase';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function UsersPage() {
  const firestore = useFirestore();
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading, error } = useCollection<{email: string}>(usersQuery);

  return (
    <div>
      <PageHeader
        title="Registered Users"
        description="Here is a list of all users who have signed up for PetLife."
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
                <TableHead>Email</TableHead>
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
                </TableRow>
              ))}
              {error && (
                <TableRow>
                  <TableCell colSpan={1} className="text-center text-destructive">
                    Failed to load users. Please try again.
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
                        <span>{user.email}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={1} className="text-center text-muted-foreground">
                    No users have registered yet.
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
