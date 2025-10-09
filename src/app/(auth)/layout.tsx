import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <Link href="/">
                        <Logo />
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
