import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Plus, Filter, X, Loader2, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  user_id: string;
  title: string;
  type: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  capacity: number;
  organizer: string;
  emoji: string;
  description: string | null;
  rsvp_count?: number;
  is_rsvpd?: boolean;
}

const eventTypes = ["Workshop", "Training", "Meetup", "Event"];
const eventEmojis = ["✂️", "💻", "🤝", "🧶", "🍽️", "📊", "📅", "🎓"];

const EventsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "", type: "Workshop", event_date: "", start_time: "", end_time: "",
    location: "", capacity: "50", organizer: "", emoji: "📅", description: "",
  });

  const fetchEvents = async () => {
    const { data } = await (supabase as any).from("events").select("*").order("event_date", { ascending: true });
    if (!data) { setLoading(false); return; }

    const enriched: Event[] = [];
    for (const ev of data as any[]) {
      const { count } = await (supabase as any).from("event_rsvps").select("*", { count: "exact", head: true }).eq("event_id", ev.id);
      let is_rsvpd = false;
      if (user) {
        const { data: r } = await (supabase as any).from("event_rsvps").select("id").eq("event_id", ev.id).eq("user_id", user.id).maybeSingle();
        is_rsvpd = !!r;
      }
      enriched.push({ ...ev, rsvp_count: count || 0, is_rsvpd });
    }
    setEvents(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const channel = supabase.channel("events_rt").on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await (supabase as any).from("events").insert({
      user_id: user.id, title: form.title, type: form.type, event_date: form.event_date,
      start_time: form.start_time || null, end_time: form.end_time || null,
      location: form.location, capacity: parseInt(form.capacity) || 50,
      organizer: form.organizer, emoji: form.emoji, description: form.description || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Event created!" });
      setForm({ title: "", type: "Workshop", event_date: "", start_time: "", end_time: "", location: "", capacity: "50", organizer: "", emoji: "📅", description: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleRsvp = async (eventId: string) => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const ev = events.find((e) => e.id === eventId);
    if (ev?.is_rsvpd) {
      await (supabase as any).from("event_rsvps").delete().eq("user_id", user.id).eq("event_id", eventId);
      toast({ title: "RSVP cancelled" });
    } else {
      if (ev && (ev.rsvp_count || 0) >= ev.capacity) { toast({ title: "Event is full", variant: "destructive" }); return; }
      await (supabase as any).from("event_rsvps").insert({ user_id: user.id, event_id: eventId });
      toast({ title: "RSVP confirmed!" });
    }
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("events").delete().eq("id", id);
  };

  const filtered = (activeFilter === "All" ? events : events.filter((e) => e.type === activeFilter))
    .filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Events & Meetups</h1>
              <p className="text-muted-foreground text-sm">Workshops, training sessions & community gatherings</p>
            </div>
            <Button onClick={() => { if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; } setShowForm(!showForm); }} className="rounded-xl">
              {showForm ? <X size={16} /> : <Plus size={16} />}
              <span className="hidden sm:inline ml-1">{showForm ? "Cancel" : "Create Event"}</span>
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-4 py-3 shadow-sm border border-border">
              <Search size={18} className="text-muted-foreground" />
              <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Filter size={16} className="text-muted-foreground shrink-0" />
            {["All", ...eventTypes].map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4">
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Event Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Input type="date" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                  <Input placeholder="Start Time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  <Input placeholder="End Time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                  <Input placeholder="Location *" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  <Input placeholder="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                  <Input placeholder="Organizer *" required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
                  <select value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {eventEmojis.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <Button type="submit" disabled={submitting} className="rounded-xl">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                  <span className="ml-1">{submitting ? "Creating..." : "Create Event"}</span>
                </Button>
              </form>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((event, i) => {
                const fillPercent = Math.round(((event.rsvp_count || 0) / event.capacity) * 100);
                const spotsLeft = event.capacity - (event.rsvp_count || 0);
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{event.emoji}</div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{event.type}</span>
                        </div>
                      </div>
                      {user && user.id === event.user_id && (
                        <button onClick={() => handleDelete(event.id)} className="text-destructive hover:text-destructive/80 p-1"><Trash2 size={14} /></button>
                      )}
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Calendar size={14} /><span>{new Date(event.event_date).toLocaleDateString()}</span></div>
                      {event.start_time && <div className="flex items-center gap-2"><Clock size={14} /><span>{event.start_time}{event.end_time ? ` – ${event.end_time}` : ""}</span></div>}
                      <div className="flex items-center gap-2"><MapPin size={14} /><span className="truncate">{event.location}</span></div>
                      <div className="flex items-center gap-2"><Users size={14} /><span>{event.organizer}</span></div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{event.rsvp_count} attending</span>
                        <span>{spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(fillPercent, 100)}%` }} />
                      </div>
                    </div>
                    <button onClick={() => handleRsvp(event.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors active:scale-[0.96] ${
                        event.is_rsvpd ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}>
                      {event.is_rsvpd ? "Cancel RSVP" : "RSVP"}
                    </button>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground text-sm">No events found. Create one!</div>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventsPage;
