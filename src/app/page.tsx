import Image from 'next/image';
import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
        <div className="flex items-center gap-2">
          <PawPrint className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">PetLife</h1>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-12 md:py-24">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-headline font-bold text-gray-800">
              A long, healthy life for your best friend.
            </h2>
            <p className="text-lg text-gray-600">
              PetLife uses AI to create personalized meal plans, recommend supplements, and help you track your pet's health for a vibrant, longer life.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} PetLife. All rights reserved.</p>
      </footer>
    </div>
  );
}
