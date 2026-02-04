
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPayPalOrder } from '@/app/actions/paypal';


type ProSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProSubscriptionDialog({ open, onOpenChange }: ProSubscriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    const result = await createPayPalOrder();

    if (result.success && result.link) {
        window.open(result.link, '_blank');
        onOpenChange(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: result.error || 'Could not create PayPal payment link.',
        });
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-headline">Upgrade to PetLife Pro</DialogTitle>
          <DialogDescription className="text-center">
            Unlock exclusive features to take care of your pet.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="text-center">
                <span className="text-4xl font-bold">10€</span>
                <span className="text-muted-foreground">/month</span>
            </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Unlimited analysis and recommendations</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Advanced health tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>
        <DialogFooter className="flex-col gap-4">
             <Button 
                type="button" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                onClick={handleSubscribe} 
                disabled={isLoading}
              >
                {isLoading ? 'Creating order...' : 'Subscribe with PayPal'}
              </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
