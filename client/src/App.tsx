import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CreateBounty from "@/pages/create-bounty";
import ManageBounty from "@/pages/manage-bounty";
import { useEffect } from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary/10">
        <div className="container mx-auto py-4">
          <h1 className="text-3xl font-bold text-primary">NS Bounties</h1>
        </div>
      </header>
      <main className="bg-primary/5">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateBounty} />
      <Route path="/manage/:url" component={ManageBounty} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.title = "NS Bounties";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;