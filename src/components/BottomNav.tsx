import { Home, Users, Briefcase, Heart, MapPin } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Connect", path: "/connect" },
  { icon: Briefcase, label: "Grow", path: "/grow" },
  { icon: Heart, label: "Support", path: "/support" },
  { icon: MapPin, label: "Find", path: "/find" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/50 backdrop-blur-2xl border-t border-border/20 md:hidden safe-area-bottom">
      <div className="pride-bar w-full" />
      <div className="flex items-center justify-around py-1.5 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
          const isHome = item.path === "/" && location.pathname === "/";
          const active = isActive || isHome;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-2xl transition-all duration-500 relative ${
                active
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              }`}
            >
              {active && (
                <>
                  {/* Outer soft teal halo — Moooi string-light glow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-3 rounded-full blur-2xl opacity-80 animate-[soft-pulse_3s_ease-in-out_infinite]"
                    style={{
                      background:
                        "radial-gradient(circle, hsl(var(--primary) / 0.55) 0%, hsl(var(--primary) / 0.25) 40%, transparent 70%)",
                    }}
                  />
                  {/* Inner warm glow chip */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--secondary) / 0.12))",
                      boxShadow:
                        "0 0 18px hsl(var(--primary) / 0.45), 0 0 36px hsl(var(--primary) / 0.25), inset 0 1px 1px hsl(0 0% 100% / 0.35)",
                    }}
                  />
                </>
              )}
              <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} className="relative z-10" />
              <span className={`text-[10px] relative z-10 ${active ? "font-black" : "font-semibold"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
