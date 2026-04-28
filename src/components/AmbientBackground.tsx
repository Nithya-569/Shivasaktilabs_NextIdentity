// Poetic, glowing ambient background inspired by warm string-lights.
// Pure visual layer — fixed behind all content, no interactivity, no backend impact.
const AmbientBackground = () => {
  // Pre-defined "fireflies" / string-light positions for a graceful, organic feel
  const lights = [
    { top: "8%", left: "12%", size: 6, delay: "0s", dur: "5.5s", hue: "var(--secondary)" },
    { top: "14%", left: "78%", size: 4, delay: "1.2s", dur: "6.5s", hue: "var(--accent)" },
    { top: "22%", left: "32%", size: 5, delay: "0.6s", dur: "7s", hue: "var(--primary)" },
    { top: "30%", left: "62%", size: 7, delay: "2s", dur: "5s", hue: "var(--secondary)" },
    { top: "42%", left: "18%", size: 4, delay: "1.5s", dur: "6s", hue: "var(--accent)" },
    { top: "48%", left: "85%", size: 6, delay: "0.3s", dur: "7.5s", hue: "var(--secondary)" },
    { top: "58%", left: "45%", size: 5, delay: "2.4s", dur: "5.8s", hue: "var(--primary)" },
    { top: "66%", left: "8%", size: 4, delay: "1s", dur: "6.2s", hue: "var(--accent)" },
    { top: "72%", left: "70%", size: 6, delay: "0.8s", dur: "6.8s", hue: "var(--secondary)" },
    { top: "82%", left: "28%", size: 5, delay: "1.8s", dur: "5.4s", hue: "var(--primary)" },
    { top: "88%", left: "88%", size: 4, delay: "2.6s", dur: "7.2s", hue: "var(--accent)" },
    { top: "92%", left: "55%", size: 7, delay: "0.4s", dur: "6.6s", hue: "var(--secondary)" },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft base wash: teal → peach → lavender */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, hsl(174 80% 26% / 0.10) 0%, hsl(30 80% 92% / 0.55) 35%, hsl(330 81% 88% / 0.45) 65%, hsl(263 70% 88% / 0.55) 100%)",
        }}
      />

      {/* Big poetic glow orbs */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-50"
        style={{ background: "radial-gradient(circle, hsl(174 80% 60% / 0.45), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-50"
        style={{ background: "radial-gradient(circle, hsl(330 81% 80% / 0.5), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 left-1/4 w-[560px] h-[560px] rounded-full blur-3xl opacity-45"
        style={{ background: "radial-gradient(circle, hsl(263 70% 80% / 0.45), transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-[380px] h-[380px] rounded-full blur-3xl opacity-35"
        style={{ background: "radial-gradient(circle, hsl(40 95% 75% / 0.5), transparent 70%)" }}
      />

      {/* Warm golden string-lights / fireflies */}
      {lights.map((l, i) => (
        <span
          key={i}
          className="absolute rounded-full firefly"
          style={{
            top: l.top,
            left: l.left,
            width: `${l.size}px`,
            height: `${l.size}px`,
            background: `hsl(${l.hue.includes("primary") ? "174 80% 65%" : l.hue.includes("accent") ? "263 70% 80%" : "40 95% 70%"})`,
            boxShadow: `0 0 ${l.size * 3}px hsl(40 95% 70% / 0.7), 0 0 ${l.size * 6}px hsl(40 95% 70% / 0.35)`,
            animationDelay: l.delay,
            animationDuration: l.dur,
          }}
        />
      ))}

      {/* Subtle grain / film texture for premium feel */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
};

export default AmbientBackground;
