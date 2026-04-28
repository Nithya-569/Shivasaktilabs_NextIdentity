import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Plus, X, Loader2, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import VerifiedBadge from "@/components/VerifiedBadge";
import CommunityChatDialog from "@/components/CommunityChatDialog";

interface Community {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  emoji: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

const emojis = ["🍽️", "💇", "🏙️", "🧶", "💻", "🤝", "👥", "🎨", "🚀"];
const categories = ["Business", "Local", "Learning", "Support", "General"];

const isPostComplete = (c: Community) => !!(c.name && c.description);

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "", category: "General", emoji: "👥" });
  const [chatTarget, setChatTarget] = useState<Community | null>(null);

  const fetchCommunities = async () => {
    const { data } = await (supabase as any).from("communities").select("*").order("created_at", { ascending: false });
    if (!data) { setLoading(false); return; }
    const enriched: Community[] = [];
    for (const c of data as any[]) {
      const { count } = await (supabase as any).from("community_members").select("*", { count: "exact", head: true }).eq("community_id", c.id);
      let is_member = false;
      if (user) {
        const { data: mem } = await (supabase as any).from("community_members").select("id").eq("community_id", c.id).eq("user_id", user.id).maybeSingle();
        is_member = !!mem;
      }
      enriched.push({ ...c, member_count: count || 0, is_member });
    }
    setCommunities(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchCommunities();
    const channel = supabase.channel("communities_rt").on("postgres_changes", { event: "*", schema: "public", table: "communities" }, () => fetchCommunities()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await (supabase as any).from("communities").insert({
      user_id: user.id, name: form.name, description: form.description || null, category: form.category, emoji: form.emoji,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Community created! 🎉" }); setForm({ name: "", description: "", category: "General", emoji: "👥" }); setShowForm(false); }
    setSubmitting(false);
  };

  const handleJoin = async (communityId: string) => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const c = communities.find((x) => x.id === communityId);
    if (c?.is_member) {
      await (supabase as any).from("community_members").delete().eq("user_id", user.id).eq("community_id", communityId);
      toast({ title: "Left community" });
    } else {
      await (supabase as any).from("community_members").insert({ user_id: user.id, community_id: communityId });
      toast({ title: "Joined! 🎉" });
    }
    fetchCommunities();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("communities").delete().eq("id", id);
  };

  const filteredCommunities = communities.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black mb-1 text-foreground">Communities</h2>
            <p className="text-muted-foreground text-sm">Find your people, build together</p>
          </div>
          <Button onClick={() => { if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; } setShowForm(!showForm); }} className="rounded-2xl font-bold shadow-card">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span className="hidden sm:inline ml-1">{showForm ? "Cancel" : "Create"}</span>
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-3 shadow-card border border-border/40">
            <Search size={18} className="text-muted-foreground" />
            <input type="text" placeholder="Search communities..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
            <form onSubmit={handleSubmit} className="card-glow p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Community Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {emojis.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
              </div>
              <Button type="submit" disabled={submitting} className="rounded-2xl font-bold shadow-card">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                <span className="ml-1">{submitting ? "Creating..." : "Create Community"}</span>
              </Button>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community, i) => (
              <motion.div key={community.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card-glow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary/15 to-accent/10 flex items-center justify-center text-xl shadow-soft">{community.emoji}</div>
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        {community.name}
                        {isPostComplete(community) && <VerifiedBadge ai />}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 bg-muted/60 rounded-full text-muted-foreground font-bold">{community.category}</span>
                    </div>
                  </div>
                  {user && user.id === community.user_id && (
                    <button onClick={() => handleDelete(community.id)} className="text-destructive hover:text-destructive/80 p-1"><Trash2 size={14} /></button>
                  )}
                </div>
                {community.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4">{community.description}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1"><Users size={12} />{community.member_count}</span>
                    <button
                      onClick={() => {
                        if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
                        setChatTarget(community);
                      }}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <MessageCircle size={12} />Chat
                    </button>
                  </div>
                  <button onClick={() => handleJoin(community.id)}
                    className={`text-sm font-bold px-4 py-1.5 rounded-xl transition-all duration-300 ${community.is_member ? "bg-muted/60 text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-soft"}`}>
                    {community.is_member ? "Joined ✓" : "Join"}
                  </button>
                </div>
              </motion.div>
            ))}
            {filteredCommunities.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground text-sm">{search ? "No communities match your search." : "No communities yet. Create the first one! 🌟"}</div>}
          </div>
        )}
      </motion.div>

      <CommunityChatDialog
        communityId={chatTarget?.id || null}
        communityName={chatTarget?.name || ""}
        emoji={chatTarget?.emoji || "👥"}
        open={!!chatTarget}
        onOpenChange={(o) => { if (!o) setChatTarget(null); }}
      />
    </div>
  );
};

export default CommunityPage;
