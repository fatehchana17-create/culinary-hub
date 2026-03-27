import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import PublicMenu from "@/pages/PublicMenu";
import AdminLogin from "@/pages/admin/Login";
import LiveOrders from "@/pages/admin/LiveOrders";
import MenuItemsAdmin from "@/pages/admin/MenuItems";
import EventsAdmin from "@/pages/admin/Events";
import AdsAdmin from "@/pages/admin/Ads";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicMenu} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={LiveOrders} />
      <Route path="/admin/menu" component={MenuItemsAdmin} />
      <Route path="/admin/events" component={EventsAdmin} />
      <Route path="/admin/ads" component={AdsAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
