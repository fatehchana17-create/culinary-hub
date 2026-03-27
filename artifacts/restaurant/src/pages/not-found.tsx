import { Link } from "wouter";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-8">
        <ChefHat className="w-20 h-20 text-primary" />
      </div>
      <h1 className="font-display text-6xl md:text-8xl font-bold text-foreground mb-4">404</h1>
      <p className="text-2xl font-semibold text-muted-foreground mb-8 font-sans">
        Looks like this dish isn't on the menu.
      </p>
      <Link href="/" className="inline-block">
        <Button size="lg" className="text-lg px-8 rounded-full shadow-xl shadow-primary/20">
          Back to Kitchen
        </Button>
      </Link>
    </div>
  );
}
