import { Home, Users, Briefcase, Heart, MapPin, UserCircle, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Connect", path: "/connect" },
  { icon: Briefcase, label: "Grow", path: "/grow" },
  { icon: Heart, label: "Support", path: "/support" },
  { icon: MapPin, label: "Find", path: "/find" },
];

const TopNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-card/40 backdrop-blur-2xl border-b border-border/20">
      <div className="pride-bar w-full" />
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl gradient-warm flex items-center justify-center shadow-card group-hover:shadow-glow transition-shadow duration-300">
            <span className="text-primary-foreground font-black text-sm">NI</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-foreground leading-tight">NextIdentity</span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Your safe space 🌈</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
            const isHome = item.path === "/" && location.pathname === "/";
            const active = isActive || isHome;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  active
                    ? "bg-primary/10 text-primary glow-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}

          <div className="w-px h-6 bg-border mx-2" />

          <Link
            to={user ? "/profile" : "/auth"}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-300 ${
              location.pathname === "/profile" || location.pathname === "/auth"
                ? "gradient-warm text-primary-foreground shadow-glow"
                : "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-card"
            }`}
          >
            {user ? <UserCircle size={16} /> : <LogIn size={16} />}
            {user ? "Profile" : "Sign In"}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
