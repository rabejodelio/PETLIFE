import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <PawPrint className="w-7 h-7 text-primary" />
      {!iconOnly && (
        <span className="text-xl font-bold font-headline text-primary">PetLife</span>
      )}
    </div>
  );
}
