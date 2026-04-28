import { CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  ai?: boolean;
  size?: "sm" | "md";
}

const VerifiedBadge = ({ ai = false, size = "sm" }: VerifiedBadgeProps) => {
  if (ai) {
    return (
      <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-primary/15 to-accent/15 text-primary font-black rounded-full border border-primary/20 shadow-soft ${size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}>
        <ShieldCheck size={size === "sm" ? 11 : 13} />
        AI Verified
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 bg-primary/10 text-primary font-black rounded-full border border-primary/20 ${size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs"}`}>
      <CheckCircle2 size={size === "sm" ? 11 : 13} />
      VERIFIED
    </span>
  );
};

export default VerifiedBadge;
