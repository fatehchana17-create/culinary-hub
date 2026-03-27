import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetAuthStatus, useAdminLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  ListTree, 
  CalendarRange, 
  Megaphone, 
  ChefHat, 
  LogOut,
  MenuSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Live Orders", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu Items", icon: ListTree },
  { href: "/admin/events", label: "Events & Discounts", icon: CalendarRange },
  { href: "/admin/ads", label: "Hero Ads", icon: Megaphone },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: auth, isLoading } = useGetAuthStatus();
  const { mutate: logout } = useAdminLogout({
    mutation: {
      onSuccess: () => setLocation("/admin/login")
    }
  });

  useEffect(() => {
    if (!isLoading && !auth?.authenticated) {
      setLocation("/admin/login");
    }
  }, [isLoading, auth, setLocation]);

  if (isLoading || !auth?.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-72 bg-card border-r border-border/50 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="p-8 pb-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">Admin</span>
          </div>
          <Button variant="ghost" size="icon">
            <MenuSquare className="w-6 h-6" />
          </Button>
        </header>
        
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
