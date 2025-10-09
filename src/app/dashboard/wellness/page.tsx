import Image from 'next/image';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

const wellnessArticles = [
  {
    id: 1,
    title: '5 Ways to Reduce Separation Anxiety',
    description: 'Help your dog feel more comfortable when you\'re away with these simple techniques.',
    imageId: 'wellness1',
  },
  {
    id: 2,
    title: 'The Power of Puzzle Feeders',
    description: 'Turn mealtime into a fun mental challenge for your cat or dog.',
    imageId: 'wellness2',
  },
  {
    id: 3,
    title: 'Doga: Practicing Yoga with Your Dog',
    description: 'Find your zen together and strengthen your bond with these beginner-friendly poses.',
    imageId: 'wellness3',
  },
   {
    id: 4,
    title: 'Understanding Your Cat\'s Body Language',
    description: 'Learn to read the subtle cues your feline friend is giving you to better understand their mood.',
    imageId: 'wellness4',
  },
];

export default function WellnessPage() {
    return (
        <div>
            <PageHeader
                title="Wellness & Enrichment"
                description="Tips and techniques for a happy, stress-free pet."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wellnessArticles.map((article) => {
                    const image = PlaceHolderImages.find(img => img.id === article.imageId);
                    return (
                        <Card key={article.id} className="flex flex-col overflow-hidden shadow-md">
                            <CardHeader className="p-0">
                                <div className="relative h-48 w-full">
                                    {image && (
                                        <Image
                                            src={image.imageUrl}
                                            alt={image.description}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={image.imageHint}
                                        />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow p-6">
                                <CardTitle className="font-headline text-xl mb-2">{article.title}</CardTitle>
                                <CardDescription>{article.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button variant="outline">Read More</Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
