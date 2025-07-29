import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  BookOpen, 
  Settings,
  Brain,
  Shield
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Daily Check-in', href: '/check-in', icon: Calendar },
  { name: 'AI Chat', href: '/chat', icon: MessageCircle },
  { name: 'Mood Trends', href: '/trends', icon: TrendingUp },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">MindEase</h1>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  isActive 
                    ? "bg-primary/5 text-primary border border-primary/20" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                  <Icon className={cn(
                    "mr-3 w-5 h-5",
                    isActive ? "text-primary" : "text-gray-400"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="px-4 py-4">
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Privacy Protected</span>
            </div>
            <p className="text-xs mt-1 opacity-90">Your data is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
