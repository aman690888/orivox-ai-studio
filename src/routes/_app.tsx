import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CommandPalette, useCommandPalette } from "@/components/command/CommandPalette";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Home, Settings, Layers, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-white text-black font-sans overflow-hidden selection:bg-black/10">
      <Sidebar />
      <main className="flex-1 relative overflow-y-auto bg-white z-10">
        <div className="h-full w-full">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}

function Sidebar() {
  const loc = useLocation();
  const { open } = useCommandPalette();
  const { user } = useAuth();
  
  const navItems = [
    { name: "Home", path: "/home", icon: Home },
    { name: "Presentations", path: "/presentations", icon: Layers },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <aside className="w-[240px] shrink-0 flex flex-col px-3 py-6 bg-transparent border-r border-black">
      <div className="flex items-center gap-2 px-3 mb-8">
        <Logo showWord={true} />
      </div>
      
      <div className="mb-6 px-2">
         <button onClick={open} className="group flex items-center gap-3 w-full bg-white text-black transition-all px-3 py-2 text-sm border border-black hard-shadow-hover">
            <Search className="w-4 h-4 text-black transition-colors" />
            <span className="font-mono font-bold">Search</span>
            <span className="ml-auto text-[10px] border-l border-black px-1.5 py-0.5 text-black font-mono">⌘K</span>
         </button>
      </div>

      <nav className="flex-1 space-y-2 px-2">
        {navItems.map((item) => {
          const isActive = loc.pathname.startsWith(item.path) || (loc.pathname === '/' && item.path === '/home');
          return (
            <Link key={item.path} to={item.path} className={`relative flex items-center gap-3 px-3 py-2 text-sm font-mono font-bold transition-all border border-black hard-shadow-hover ${isActive ? "bg-black text-white" : "bg-white text-black"}`}>
              <item.icon className={`w-[16px] h-[16px] relative z-10 transition-colors ${isActive ? "text-white" : "text-black"}`} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <div className="group flex items-center gap-3 bg-white p-2 border border-black hard-shadow-hover cursor-pointer">
           <div className="w-8 h-8 bg-black flex items-center justify-center text-xs font-mono font-bold text-white">
             {userName.charAt(0).toUpperCase()}
           </div>
           <div className="flex flex-col flex-1 min-w-0">
             <span className="text-xs font-mono font-bold truncate text-black">{userName}</span>
             <span className="text-[10px] font-mono text-black truncate">Free Plan</span>
           </div>
        </div>
      </div>
    </aside>
  );
}
