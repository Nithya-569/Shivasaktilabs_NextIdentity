import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "🥰", label: "Loved" },
  { emoji: "😴", label: "Tired" },
  { emoji: "💪", label: "Strong" },
];

interface MoodEntry {
  id: string;
  mood: string;
  note: string | null;
  created_at: string;
}

export default function MoodJournal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setEntries(data);
  };

  const save = async () => {
    if (!selectedMood || !user) return;
    setLoading(true);
    const { error } = await supabase.from("mood_entries").insert({
      user_id: user.id,
      mood: selectedMood,
      note: note.trim() || null,
    });
    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mood logged 💛", description: "Your feelings matter." });
      setSelectedMood(null);
      setNote("");
      fetchEntries();
    }
    setLoading(false);
  };

  const moodEmoji = (label: string) => MOODS.find((m) => m.label === label)?.emoji || "🫶";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md h-[85vh] sm:h-auto sm:max-h-[80vh] bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="font-bold text-foreground">Mood Journal 🌸</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Mood selector */}
          {user ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">How are you feeling right now?</p>
              <div className="grid grid-cols-4 gap-3">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setSelectedMood(m.label)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                      selectedMood === m.label
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {selectedMood && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Want to share more about how you feel? (optional)"
                      className="w-full bg-muted/40 rounded-2xl px-4 py-3 text-sm outline-none resize-none h-20 placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30"
                    />
                    <Button onClick={save} disabled={loading} className="w-full rounded-2xl mt-2 font-bold">
                      <Plus size={14} className="mr-1" /> Log Mood
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* History */}
              {entries.length > 0 && (
                <div className="pt-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent entries</p>
                  {entries.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/30">
                      <span className="text-xl">{moodEmoji(e.mood)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{e.mood}</p>
                        {e.note && <p className="text-xs text-muted-foreground mt-0.5">{e.note}</p>}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Please sign in to use the mood journal 💛</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </motion.div>
  );
}
