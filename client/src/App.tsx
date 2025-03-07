import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from "@/lib/wagmi";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CreateBounty from "@/pages/create-bounty";
import ManageBounty from "@/pages/manage-bounty";
import { useEffect } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import BountyDetails from "@/pages/bounty-details";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-primary/10">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-primary hover:opacity-80 cursor-pointer">
              NS Bounties 🤑
            </h1>
          </Link>
          <WalletConnect />
        </div>
      </header>
      <main className="bg-primary/5">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateBounty} />
      <Route path="/manage/:url" component={ManageBounty} />
      <Route path="/bounty/:id" component={BountyDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.title = "NS Bounties 🤑";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default App;