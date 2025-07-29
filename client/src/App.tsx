import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Dashboard from "@/pages/dashboard";
import CheckIn from "@/pages/check-in";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/check-in" component={CheckIn} />
      <Route path="/chat" component={Chat} />
      <Route path="/trends" component={() => <div>Mood Trends (Coming Soon)</div>} />
      <Route path="/resources" component={() => <div>Resources (Coming Soon)</div>} />
      <Route path="/settings" component={() => <div>Settings (Coming Soon)</div>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          
          <div className="lg:pl-64 flex flex-col flex-1">
            <Header />
            <Router />
          </div>
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
