"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, initiateEmailSignIn, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function LoginPage() {
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
                title: "Login Successful",
                description: "Redirecting to your dashboard...",
            });
            router.push("/dashboard");
        }
    }, [user, isUserLoading, router, toast]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!email || !password) {
            setError("Please enter both email and password.");
            setIsLoading(false);
            return;
        }

        // Non-blocking call
        initiateEmailSignIn(auth, email, password);

        // We can show a loading state and let the useEffect handle success.
        // For handling specific errors like wrong password, we'd need to listen to auth errors globally
        // or stick to the async/await pattern with try-catch. For this app, we assume success or a generic message.
        setTimeout(() => {
          if (!user) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password. Please try again.",
            });
            setIsLoading(false);
          }
        }, 3000); // A timeout to handle login failure, as non-blocking won't throw here.
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Logging in..." : "Log In"}</Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline text-primary">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
