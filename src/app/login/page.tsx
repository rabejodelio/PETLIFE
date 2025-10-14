"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Logo } from "@/components/logo";

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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!email || !password) {
            setError("Please enter both email and password.");
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The useEffect hook will handle the successful redirection.
        } catch (error: any) {
            let errorMessage = "Invalid email or password. Please try again.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
            }
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            });
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                <Card className="bg-white p-8 rounded-lg shadow-md">
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
            </div>
        </div>
    );
}
