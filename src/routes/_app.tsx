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
    <div className="flex h-screen w-full bg-[#0E0E10] text-foreground font-sans overflow-hidden selection:bg-electric/30">
      <Sidebar />
      <main className="flex-1 relative overflow-y-auto bg-background rounded-l-[2rem] border-l border-white/5 shadow-2xl transition-all duration-500 z-10">
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
    <aside className="w-[240px] shrink-0 flex flex-col px-3 py-6 bg-transparent">
      <div className="flex items-center gap-2 px-3 mb-8">
        <Logo showWord={true} />
      </div>
      
      <div className="mb-6 px-2">
         <button onClick={open} className="group flex items-center gap-3 w-full bg-white/[0.03] hover:bg-white/[0.08] text-muted-foreground hover:text-white transition-all rounded-lg px-3 py-2 text-sm border border-white/5 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
            <span className="font-medium">Search</span>
            <span className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 font-mono">⌘K</span>
         </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = loc.pathname.startsWith(item.path) || (loc.pathname === '/' && item.path === '/home');
          return (
            <Link key={item.path} to={item.path} className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive ? "text-white" : "text-muted-foreground hover:text-white"}`}>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/10 rounded-lg border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isActive && (
                <motion.div
                   layoutId="sidebar-active-glow"
                   className="absolute left-[-12px] w-[3px] h-4 bg-electric rounded-r-full shadow-[0_0_8px_var(--electric)]"
                />
              )}
              <item.icon className={`w-[16px] h-[16px] relative z-10 transition-colors ${isActive ? "text-white" : ""}`} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <div className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-2 rounded-xl border border-white/5 cursor-pointer">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-electric to-violet flex items-center justify-center text-xs font-semibold text-white shadow-inner">
             {userName.charAt(0).toUpperCase()}
           </div>
           <div className="flex flex-col flex-1 min-w-0">
             <span className="text-xs font-medium truncate text-foreground group-hover:text-white transition-colors">{userName}</span>
             <span className="text-[10px] text-muted-foreground truncate">Free Plan</span>
           </div>
        </div>
      </div>
    </aside>
  );
}
