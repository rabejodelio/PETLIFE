
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
import { Sparkles, CheckCircle, Ticket } from 'lucide-react';
import { createPayPalSubscription } from '@/app/actions/paypal';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProSubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProSuccess: () => void;
};

const PRO_CODE = "petlife7296";

export function ProSubscriptionDialog({ open, onOpenChange, onProSuccess }: ProSubscriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');

  const handleSubscribe = async () => {
    setIsLoading(true);
    const result = await createPayPalSubscription();
    
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur de paiement',
        description: result.error || 'Impossible de créer l\'abonnement PayPal. Veuillez réessayer.',
      });
      setIsLoading(false);
    }
  };

  const handlePromoCode = () => {
    if (promoCode === PRO_CODE) {
      onProSuccess();
      onOpenChange(false);
      toast({
        title: 'Félicitations !',
        description: 'Vous avez débloqué l\'accès Pro.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Code invalide',
        description: 'Le code que vous avez entré n\'est pas valide.',
      });
    }
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
          <DialogTitle className="text-center text-2xl font-headline">Passez à PetLife Pro</DialogTitle>
          <DialogDescription className="text-center">
            Débloquez des fonctionnalités exclusives pour prendre soin de votre animal.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="text-center">
                <span className="text-4xl font-bold">10€</span>
                <span className="text-muted-foreground">/mois</span>
            </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Analyses et recommandations IA illimitées</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Suivi de santé avancé</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Support prioritaire</span>
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
                {isLoading ? 'Redirection...' : 'S\'abonner avec PayPal'}
              </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    OU
                    </span>
                </div>
            </div>
            <div className='flex flex-col space-y-2'>
                <Label htmlFor="promo-code" className='text-left'>Code promotionnel</Label>
                <div className='flex gap-2 w-full'>
                    <Input id="promo-code" placeholder="petlife7296" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-grow" />
                    <Button type="button" variant="outline" onClick={handlePromoCode}>Appliquer</Button>
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
