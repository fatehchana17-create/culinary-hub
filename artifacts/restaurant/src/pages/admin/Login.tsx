import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { ChefHat, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { mutate: login, isPending } = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.success) {
          setLocation("/admin");
        }
      },
      onError: () => {
        setError("Invalid credentials. Please try again.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login({ data: { username, password } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-primary to-secondary p-4 rounded-2xl shadow-xl shadow-primary/20 mb-4">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-4xl text-foreground">Savoria Admin</h1>
          <p className="text-muted-foreground mt-2 font-sans">Sign in to manage your restaurant</p>
        </div>

        <Card className="p-8 shadow-2xl shadow-black/5 border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Username</label>
              <Input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
