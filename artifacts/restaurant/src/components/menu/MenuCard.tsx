import { useEffect, useState } from "react";
import { Clock, Flame } from "lucide-react";
import { format } from "date-fns";
import { MenuItem, Event } from "@workspace/api-client-react";
import { useCreateOrder } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function MenuCard({ item, activeEvent }: { item: MenuItem; activeEvent: Event | null }) {
  const [readyTime, setReadyTime] = useState<Date | null>(null);
  
  const { mutate: createOrder, isPending } = useCreateOrder();

  // Freshness timer calculation
  useEffect(() => {
    const updateTime = () => {
      setReadyTime(new Date(Date.now() + item.prepTimeLimit * 60000));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [item.prepTimeLimit]);

  const isDiscounted = activeEvent?.isActive && activeEvent.discountPercentage > 0;
  const finalPrice = isDiscounted 
    ? item.price * (1 - activeEvent.discountPercentage / 100) 
    : item.price;

  const handleOrder = () => {
    createOrder({
      data: {
        itemDetails: { itemId: item.id, name: item.name, quantity: 1 },
        totalPrice: finalPrice,
        customerInfo: { source: "whatsapp" }
      }
    }, {
      onSuccess: () => {
        const text = encodeURIComponent(`Hi Savoria! I'd like to order 1x ${item.name} for ${formatCurrency(finalPrice)}.`);
        window.open(`https://wa.me/1234567890?text=${text}`, '_blank');
      }
    });
  };

  return (
    <Card className="overflow-hidden group h-full flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={item.imageUrl || `${import.meta.env.BASE_URL}images/food-placeholder.png`}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/food-placeholder.png`;
          }}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-foreground font-bold shadow-md">
            {item.category}
          </Badge>
          {!item.isAvailable && (
            <Badge variant="destructive" className="shadow-md font-bold">Sold Out</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display text-2xl font-bold leading-tight mr-4">{item.name}</h3>
          <div className="text-right">
            {isDiscounted ? (
              <div className="flex flex-col items-end">
                <span className="text-primary font-bold text-xl">{formatCurrency(finalPrice)}</span>
                <span className="text-muted-foreground text-sm line-through decoration-destructive decoration-2">{formatCurrency(item.price)}</span>
              </div>
            ) : (
              <span className="text-primary font-bold text-xl">{formatCurrency(item.price)}</span>
            )}
          </div>
        </div>

        {isDiscounted && (
          <div className="mb-4 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary p-2 rounded-r-lg flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">{activeEvent.name} - {activeEvent.discountPercentage}% OFF!</span>
          </div>
        )}

        <div className="mt-auto pt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/50">
            <Clock className="w-4 h-4 text-secondary-foreground" />
            <span>
              Ready in ~{item.prepTimeLimit}m 
              {readyTime && <span className="font-semibold text-foreground"> (at {format(readyTime, 'h:mm a')})</span>}
            </span>
          </div>
          
          <Button 
            className="w-full text-base" 
            size="lg" 
            variant="whatsapp"
            disabled={!item.isAvailable || isPending}
            onClick={handleOrder}
          >
            {isPending ? "Preparing Order..." : "Order via WhatsApp"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
