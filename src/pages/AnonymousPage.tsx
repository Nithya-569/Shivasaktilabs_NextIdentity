import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Heart, Plus, X, Loader2, Send, Shield, Sparkles, MessageCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AnonReply {
  id: string;
  content: string;
  emoji: string;
  created_at: string;
  user_id: string;
}

interface AnonPost {
  id: string;
  content: string;
  category: string;
  emoji: string;
  support_count: number;
  reply_count: number;
  created_at: string;
  user_id: string;
  has_supported?: boolean;
  is_flagged?: boolean;
}

const categories = ["General", "Coming Out", "Family", "Workplace", "Health", "Joy", "Advice"];
const emojis = ["💜", "🌈", "🦋", "✨", "🌸", "💪", "🤗", "🕊️"];

const AnonymousPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<AnonPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [form, setForm] = useState({ content: "", category: "General", emoji: "💜" });
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [repliesByPost, setRepliesByPost] = useState<Record<string, AnonReply[]>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, { content: string; emoji: string }>>({});
  const [replyLoading, setReplyLoading] = useState<Record<string, boolean>>({});

  const fetchPosts = async () => {
    const { data } = await (supabase as any)
      .from("anonymous_posts")
      .select("*")
      .eq("is_flagged", false)
      .order("created_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const enriched: AnonPost[] = [];
    for (const p of data as any[]) {
      const { count } = await (supabase as any)
        .from("anonymous_post_supports")
        .select("*", { count: "exact", head: true })
        .eq("post_id", p.id);

      const { count: rcount } = await (supabase as any)
        .from("anonymous_post_replies")
        .select("*", { count: "exact", head: true })
        .eq("post_id", p.id)
        .eq("is_flagged", false);

      let has_supported = false;
      if (user) {
        const { data: sup } = await (supabase as any)
          .from("anonymous_post_supports")
          .select("id")
          .eq("post_id", p.id)
          .eq("user_id", user.id)
          .maybeSingle();
        has_supported = !!sup;
      }
      enriched.push({ ...p, support_count: count || 0, reply_count: rcount || 0, has_supported });
    }
    setPosts(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel("anon_posts_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "anonymous_posts" }, () => fetchPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "anonymous_post_replies" }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const moderate = async (content: string): Promise<{ is_safe: boolean; reason: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("moderate-anonymous", { body: { content } });
      if (error) return { is_safe: true, reason: "" };
      return data || { is_safe: true, reason: "" };
    } catch {
      return { is_safe: true, reason: "" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in to post", variant: "destructive" }); return; }
    if (!form.content.trim()) return;
    setSubmitting(true);

    const mod = await moderate(form.content);
    if (!mod.is_safe) {
      toast({
        title: "Post couldn't be shared 💜",
        description: mod.reason || "Your post may not align with our community guidelines. Please rephrase with care.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const { error } = await (supabase as any).from("anonymous_posts").insert({
      user_id: user.id,
      content: form.content,
      category: form.category,
      emoji: form.emoji,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Posted anonymously 🦋", description: "Your voice matters. Stay strong." });
      setForm({ content: "", category: "General", emoji: "💜" });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleSupport = async (postId: string) => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const post = posts.find((p) => p.id === postId);
    if (post?.has_supported) {
      await (supabase as any).from("anonymous_post_supports").delete().eq("user_id", user.id).eq("post_id", postId);
    } else {
      await (supabase as any).from("anonymous_post_supports").insert({ user_id: user.id, post_id: postId });
    }
    fetchPosts();
  };

  const fetchReplies = async (postId: string) => {
    const { data } = await (supabase as any)
      .from("anonymous_post_replies")
      .select("*")
      .eq("post_id", postId)
      .eq("is_flagged", false)
      .order("created_at", { ascending: true });
    setRepliesByPost((s) => ({ ...s, [postId]: (data as AnonReply[]) || [] }));
  };

  const toggleReplies = async (postId: string) => {
    const next = !openReplies[postId];
    setOpenReplies((s) => ({ ...s, [postId]: next }));
    if (next && !repliesByPost[postId]) await fetchReplies(postId);
    if (next && !replyDrafts[postId]) setReplyDrafts((s) => ({ ...s, [postId]: { content: "", emoji: "💜" } }));
  };

  const handleReply = async (postId: string) => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const draft = replyDrafts[postId];
    if (!draft?.content.trim()) return;
    setReplyLoading((s) => ({ ...s, [postId]: true }));

    const mod = await moderate(draft.content);
    if (!mod.is_safe) {
      toast({
        title: "Reply couldn't be sent 💜",
        description: mod.reason || "Please keep replies kind and supportive.",
        variant: "destructive",
      });
      setReplyLoading((s) => ({ ...s, [postId]: false }));
      return;
    }

    const { error } = await (supabase as any).from("anonymous_post_replies").insert({
      post_id: postId,
      user_id: user.id,
      content: draft.content,
      emoji: draft.emoji,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setReplyDrafts((s) => ({ ...s, [postId]: { content: "", emoji: "💜" } }));
      await fetchReplies(postId);
      fetchPosts();
    }
    setReplyLoading((s) => ({ ...s, [postId]: false }));
  };

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const filtered = selectedCategory
    ? posts.filter((p) => p.category === selectedCategory)
    : posts;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="glass-card p-5 mb-5 border border-border/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Safe Space 🕊️</h2>
              <p className="text-xs text-muted-foreground">Protected by AI moderation • Identity always hidden</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Share your experiences, fears, joys, and questions — completely anonymously.
            All posts and replies are checked by AI to keep this space safe and supportive. 💜
          </p>
        </div>

        {/* Post button */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-sm font-bold text-muted-foreground">
              {posts.length} anonymous {posts.length === 1 ? "story" : "stories"}
            </span>
          </div>
          <Button
            onClick={() => {
              if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
              setShowForm(!showForm);
            }}
            className="rounded-2xl font-bold shadow-card"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span className="ml-1">{showForm ? "Cancel" : "Share Your Story"}</span>
          </Button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5"
            >
              <form onSubmit={handleSubmit} className="card-glow p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <EyeOff size={12} />
                  <span className="font-semibold">Posting as Anonymous — your identity is hidden</span>
                </div>

                <textarea
                  placeholder="Share what's on your mind... Your story could help someone else feel less alone. 💜"
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full min-h-[120px] bg-background/50 rounded-xl border border-border/40 p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, category: c })}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                        form.category === c
                          ? "bg-primary text-primary-foreground shadow-card"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-semibold">Mood:</span>
                  {emojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={`text-lg p-1 rounded-lg transition-all ${
                        form.emoji === e ? "bg-primary/20 scale-125" : "hover:bg-muted/50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5">
                  <Shield size={12} className="text-primary shrink-0" />
                  <span>AI will check your post for safety before publishing — usually takes 1-2 seconds.</span>
                </div>

                <Button type="submit" disabled={submitting} className="rounded-2xl font-bold shadow-card w-full">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span className="ml-1">{submitting ? "Checking & posting..." : "Post Anonymously"}</span>
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              !selectedCategory ? "bg-primary text-primary-foreground shadow-card" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === c ? "bg-primary text-primary-foreground shadow-card" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post, i) => {
              const isOpen = openReplies[post.id];
              const replies = repliesByPost[post.id] || [];
              const draft = replyDrafts[post.id] || { content: "", emoji: "💜" };
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card-glow p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center text-lg shrink-0">
                      {post.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                          <EyeOff size={10} /> Anonymous
                        </span>
                        <span className="text-xs text-muted-foreground/60">•</span>
                        <span className="text-xs text-muted-foreground/60">{timeAgo(post.created_at)}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted/50 rounded-full text-muted-foreground font-semibold">
                          {post.category}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20">
                        <button
                          onClick={() => handleSupport(post.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                            post.has_supported ? "text-pink-500" : "text-muted-foreground hover:text-pink-500"
                          }`}
                        >
                          <Heart size={14} className={post.has_supported ? "fill-current" : ""} />
                          {post.support_count > 0 && <span>{post.support_count}</span>}
                          <span>{post.has_supported ? "Supported" : "Send Support"}</span>
                        </button>
                        <button
                          onClick={() => toggleReplies(post.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-all"
                        >
                          <MessageCircle size={14} />
                          {post.reply_count > 0 && <span>{post.reply_count}</span>}
                          <span>{isOpen ? "Hide replies" : "Reply"}</span>
                        </button>
                      </div>

                      {/* Replies */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-3 overflow-hidden"
                          >
                            {replies.map((r) => (
                              <div key={r.id} className="flex items-start gap-2 bg-muted/20 rounded-xl p-3">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center text-sm shrink-0">
                                  {r.emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                      <EyeOff size={9} /> Anonymous
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60">{timeAgo(r.created_at)}</span>
                                  </div>
                                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{r.content}</p>
                                </div>
                              </div>
                            ))}
                            {replies.length === 0 && (
                              <p className="text-xs text-muted-foreground/70 text-center py-2">
                                Be the first to send a supportive reply 💜
                              </p>
                            )}

                            {/* Reply form */}
                            <div className="bg-background/40 rounded-xl p-3 space-y-2 border border-border/30">
                              <textarea
                                placeholder="Reply with kindness and support..."
                                value={draft.content}
                                onChange={(e) => setReplyDrafts((s) => ({ ...s, [post.id]: { ...draft, content: e.target.value } }))}
                                className="w-full min-h-[60px] bg-background/60 rounded-lg border border-border/30 p-2.5 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {emojis.map((e) => (
                                    <button
                                      key={e}
                                      type="button"
                                      onClick={() => setReplyDrafts((s) => ({ ...s, [post.id]: { ...draft, emoji: e } }))}
                                      className={`text-sm p-1 rounded transition-all ${
                                        draft.emoji === e ? "bg-primary/20 scale-110" : "hover:bg-muted/50"
                                      }`}
                                    >
                                      {e}
                                    </button>
                                  ))}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleReply(post.id)}
                                  disabled={replyLoading[post.id] || !draft.content.trim()}
                                  className="rounded-xl font-bold h-8 text-xs"
                                >
                                  {replyLoading[post.id] ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                  <span className="ml-1">{replyLoading[post.id] ? "Checking..." : "Send"}</span>
                                </Button>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <AlertTriangle size={10} />
                                <span>Replies are AI-moderated to keep this space safe.</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🕊️</div>
                <p className="text-muted-foreground text-sm font-medium">
                  {selectedCategory ? "No stories in this category yet." : "No stories yet. Be the first to share. 💜"}
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">Your voice matters, even when anonymous.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AnonymousPage;
