"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function SignupPage() {
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            
            toast({
                title: "Account Created!",
                description: "Redirecting you to pet onboarding.",
            });
            router.push("/onboarding");
        } catch (error: any) {
            console.error("Signup Error:", error);
            let description = "An unexpected error occurred. Please try again.";
            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        description = "This email is already registered. Please log in.";
                        break;
                    case 'auth/weak-password':
                        description = "Password is too weak. It should be at least 6 characters.";
                        break;
                    case 'auth/invalid-email':
                        description = "Please enter a valid email address.";
                        break;
                }
            }
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description,
            });
        } finally {
            setIsLoading(false);
        }
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
