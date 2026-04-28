import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface AuthorInfo {
  name: string | null;
  avatar_url: string | null;
}

interface Props {
  communityId: string | null;
  communityName: string;
  emoji: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommunityChatDialog = ({ communityId, communityName, emoji, open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [authors, setAuthors] = useState<Record<string, AuthorInfo>>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const loadAuthors = async (msgs: ChatMessage[]) => {
    const ids = Array.from(new Set(msgs.map((m) => m.user_id))).filter((id) => !authors[id]);
    if (ids.length === 0) return;
    const { data } = await (supabase as any)
      .from("profiles")
      .select("user_id, name, avatar_url")
      .in("user_id", ids);
    if (data) {
      const map: Record<string, AuthorInfo> = {};
      for (const p of data) map[p.user_id] = { name: p.name, avatar_url: p.avatar_url };
      setAuthors((prev) => ({ ...prev, ...map }));
    }
  };

  useEffect(() => {
    if (!open || !communityId) return;
    setLoading(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("community_chat_messages")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: true })
        .limit(200);
      const msgs = (data as ChatMessage[]) || [];
      setMessages(msgs);
      await loadAuthors(msgs);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`community_chat_${communityId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_chat_messages", filter: `community_id=eq.${communityId}` },
        (payload) => {
          const m = payload.new as ChatMessage;
          setMessages((prev) => [...prev, m]);
          loadAuthors([m]);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_chat_messages", filter: `community_id=eq.${communityId}` },
        (payload) => {
          const m = payload.old as ChatMessage;
          setMessages((prev) => prev.filter((x) => x.id !== m.id));
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, communityId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!user || !communityId || !text.trim()) return;
    setSending(true);
    const { error } = await (supabase as any)
      .from("community_chat_messages")
      .insert({ community_id: communityId, user_id: user.id, content: text.trim() });
    setSending(false);
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
    } else {
      setText("");
    }
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("community_chat_messages").delete().eq("id", id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl glass-card border-border/40 p-0 overflow-hidden">
        <DialogHeader className="p-5 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3 text-lg font-black">
            <span className="text-2xl">{emoji}</span>
            <div className="flex flex-col items-start leading-tight">
              <span>{communityName}</span>
              <span className="text-xs font-medium text-muted-foreground">Community chat · live</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[55vh] px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">
              Be the first to say hi 👋
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                const isMine = m.user_id === user?.id;
                const author = authors[m.user_id];
                return (
                  <div key={m.id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={author?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-muted">
                        {(author?.name || "?")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                        <span>{author?.name || "Someone"}</span>
                        <span>{format(new Date(m.created_at), "p")}</span>
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                      {isMine && (
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 mt-0.5"
                        >
                          <Trash2 size={10} /> delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border/30 flex items-center gap-2">
          <Input
            placeholder={user ? "Write a message…" : "Sign in to chat"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={!user || sending}
            className="rounded-2xl h-11"
          />
          <Button onClick={handleSend} disabled={!user || sending || !text.trim()} className="rounded-2xl h-11 px-4 shadow-glow">
            <Send size={16} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityChatDialog;
