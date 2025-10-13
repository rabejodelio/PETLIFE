"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser, initiateEmailSignUp } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function SignupPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isUserLoading && user) {
            toast({
                title: "Account Created!",
                description: "Let's create a profile for your pet.",
            });
            router.push("/onboarding");
        }
    }, [user, isUserLoading, router, toast]);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }

        // Non-blocking call
        initiateEmailSignUp(auth, email, password);

        // We show a loading state and let the onAuthStateChanged listener handle success.
        // A simple timeout can handle failures like email-already-in-use.
        setTimeout(() => {
            if (!user) { // If user is not set after a delay, assume failure.
                 toast({
                    variant: "destructive",
                    title: "Signup Failed",
                    description: "This email might already be in use. Please try another one.",
                });
                setIsLoading(false);
            }
        }, 3000); // 3-second timeout to check for login status.
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
                <CardDescription>Start your journey to a healthier pet today.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Creating Account..." : "Create Account"}</Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline text-primary">
                        Log in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
