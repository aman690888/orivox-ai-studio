import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { CommandPalette, useCommandPalette } from "@/components/command/CommandPalette";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Home, Settings, Layers, Search, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// Shared wobbly radii
const R = {
  tag: "4px 22px 6px 18px / 22px 6px 18px 4px",
  btn: "18px 6px 22px 8px / 6px 22px 8px 18px",
  md: "8px 42px 12px 38px / 42px 12px 38px 8px",
};

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
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background: "#fdfbf7",
          backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          className="flex flex-col items-center gap-3 p-8 bg-white border-[3px] border-[#2d2d2d] shadow-[6px_6px_0px_0px_#ff4d4d]"
          style={{ borderRadius: R.md }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4d4d]" />
          <p style={{ fontFamily: "Kalam, cursive", color: "#2d2d2d", fontSize: "1rem" }}>
            Just a sec...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "#fdfbf7",
        backgroundImage: "radial-gradient(#e5e0d8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        fontFamily: "Patrick Hand, cursive",
        color: "#2d2d2d",
      }}
    >
      <Sidebar />
      <main className="flex-1 relative overflow-y-auto z-10">
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  );
}

function Sidebar() {
  const loc = useLocation();
  const { open } = useCommandPalette();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/home", icon: Home, emoji: "🏠" },
    { name: "My Decks", path: "/presentations", icon: Layers, emoji: "📚" },
    { name: "Settings", path: "/settings", icon: Settings, emoji: "⚙️" },
  ];

  const favorites = [
    { id: "fav1", name: "Q3 Board Deck", emoji: "📈" },
    { id: "fav2", name: "Marketing Plan", emoji: "🎯" },
  ];

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You";
  const initials = userName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <aside className="w-[260px] shrink-0 flex flex-col border-r-[3px] border-dashed border-[#2d2d2d] bg-[#fdfbf7] relative">
      <div className="flex-1 flex flex-col px-4 py-6 overflow-y-auto">
        {/* Logo */}
        <div className="px-2 mb-6 flex items-center justify-between">
          <Logo showWord={true} />
          <button className="text-[#2d2d2d] hover:text-[#ff4d4d] transition-colors relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ff4d4d] border-[1.5px] border-[#2d2d2d] rounded-full" />
          </button>
        </div>

        {/* Quick Action & Search */}
        <div className="flex flex-col gap-2 px-1 mb-6">
          <Link
            to="/workspace/$id"
            params={{ id: "new" }}
            className="flex items-center gap-2 justify-center w-full bg-[#ff4d4d] text-white border-[2px] border-[#2d2d2d] px-3 py-2.5 text-sm font-bold shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.btn, fontFamily: "Kalam, cursive" }}
          >
            <span>✨ New Presentation</span>
          </Link>
          
          <button
            onClick={open}
            className="flex items-center gap-3 w-full bg-white border-[2px] border-[#2d2d2d] px-3 py-2 text-sm shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
          >
            <Search className="w-4 h-4 text-[#2d2d2d]" strokeWidth={2.5} />
            <span className="flex-1 text-left text-[#2d2d2d]">Search...</span>
            <span
              className="text-[10px] border-[1.5px] border-dashed border-[#2d2d2d] px-1.5 py-0.5 text-[#6b6460]"
              style={{ borderRadius: "3px" }}
            >
              ⌘K
            </span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5 px-1 mb-6">
          <p className="text-xs font-bold text-[#6b6460] uppercase tracking-wider mb-1 px-2" style={{ fontFamily: "Kalam, cursive" }}>Menu</p>
          {navItems.map((item) => {
            const isActive = loc.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3 py-2 text-sm transition-all duration-100 border-[2.5px] border-[#2d2d2d] ${
                  isActive
                    ? "bg-[#2d2d2d] text-white shadow-[3px_3px_0px_0px_#ff4d4d]"
                    : "bg-white text-[#2d2d2d] shadow-[3px_3px_0px_0px_#2d2d2d] hover:bg-[#e5e0d8] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
                style={{ borderRadius: R.tag, fontFamily: "Kalam, cursive" }}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Favorites */}
        <nav className="flex flex-col gap-1.5 px-1 mb-6">
          <div className="flex items-center justify-between mb-1 px-2">
            <p className="text-xs font-bold text-[#6b6460] uppercase tracking-wider" style={{ fontFamily: "Kalam, cursive" }}>Favorites</p>
          </div>
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              to="/workspace/$id"
              params={{ id: fav.id }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-[#4a4440] hover:text-[#2d2d2d] hover:bg-[#e5e0d8]/50 rounded-md"
              style={{ fontFamily: "Patrick Hand, cursive" }}
            >
              <span>{fav.emoji}</span>
              <span className="truncate">{fav.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Area (Credits + User) */}
      <div className="p-4 border-t-[3px] border-dashed border-[#2d2d2d] bg-white flex flex-col gap-4">
        
        {/* Credits */}
        <div className="flex items-center justify-between px-2 text-sm" style={{ fontFamily: "Patrick Hand, cursive" }}>
          <div className="flex items-center gap-2 font-bold text-[#2d2d2d]">
            <span>💎</span> 120 credits
          </div>
          <button className="text-[#2d5da1] hover:underline font-bold text-xs">Upgrade</button>
        </div>

        {/* User card */}
        <div
          className="relative bg-[#fdfbf7] border-[2px] border-[#2d2d2d] p-3 shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[1px_1px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer group"
          style={{ borderRadius: R.md }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 border-[2px] border-[#2d2d2d] flex items-center justify-center text-sm font-bold text-white bg-[#2d5da1] flex-shrink-0"
              style={{ borderRadius: "50% 40% 55% 35% / 40% 55% 35% 50%" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold truncate text-[#2d2d2d]"
                style={{ fontFamily: "Kalam, cursive" }}
              >
                {userName}
              </p>
              <p className="text-[10px] text-[#6b6460] font-bold tracking-wider uppercase">Free Plan</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
              title="Sign out"
              className="text-[#6b6460] group-hover:text-[#ff4d4d] transition-colors flex-shrink-0 bg-white border-[1.5px] border-[#2d2d2d] p-1.5 shadow-[2px_2px_0px_0px_#2d2d2d]"
              style={{ borderRadius: "6px" }}
            >
              <LogOut size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
