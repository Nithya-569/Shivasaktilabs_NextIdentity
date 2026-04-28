import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, X, Star, MapPin, Clock, Mail, Phone, Award, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "@/components/VerifiedBadge";

const CATEGORIES = ["All", "Cooking", "Business", "Marketing", "Entrepreneurship", "Financial Management"];
const AVAILABILITY_OPTIONS = ["Weekdays", "Weekends", "Evenings", "Flexible"];

interface Mentor {
  id: string;
  user_id: string;
  name: string;
  expertise: string;
  category: string;
  bio: string | null;
  experience_years: number;
  availability: string;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  is_verified: boolean;
  created_at: string;
}

const isMentorComplete = (m: Mentor) => !!(m.name && m.expertise && m.bio && m.location);

const MentorsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [formData, setFormData] = useState({
    name: "", expertise: "", category: "Business", bio: "", experience_years: 0,
    availability: "Weekends", contact_email: "", contact_phone: "", location: "",
  });

  const fetchMentors = async () => {
    const { data, error } = await (supabase as any).from("mentors").select("*").order("created_at", { ascending: false });
    if (!error && data) setMentors(data);
    setLoading(false);
  };

  useEffect(() => { fetchMentors(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const { error } = await (supabase as any).from("mentors").insert({ ...formData, user_id: user.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Registered! 🎉", description: "You are now listed as a mentor." });
      setShowForm(false);
      setFormData({ name: "", expertise: "", category: "Business", bio: "", experience_years: 0, availability: "Weekends", contact_email: "", contact_phone: "", location: "" });
      fetchMentors();
    }
  };

  const filtered = mentors.filter((m) => {
    const matchesCategory = activeFilter === "All" || m.category === activeFilter;
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.expertise.toLowerCase().includes(search.toLowerCase()) || (m.location && m.location.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground">Mentor Network</h2>
          <p className="text-muted-foreground text-sm">Connect with experienced professionals for guidance</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="rounded-2xl font-bold shadow-card">
          {showForm ? <><X className="w-4 h-4 mr-2" />Cancel</> : <><Plus className="w-4 h-4 mr-2" />Become a Mentor</>}
        </Button>
      </div>

      {showForm && (
        <div className="card-glow p-6">
          <h3 className="text-lg font-black mb-4 text-foreground">Register as a Mentor</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">Full Name *</Label><Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="rounded-xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Expertise *</Label><Input required value={formData.expertise} onChange={(e) => setFormData({ ...formData, expertise: e.target.value })} placeholder="e.g. Restaurant Management" className="rounded-xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Category *</Label>
                <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label className="font-bold">Years of Experience</Label><Input type="number" min={0} value={formData.experience_years} onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })} className="rounded-xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Availability</Label>
                <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })}>
                  {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label className="font-bold">Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, State" className="rounded-xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Email</Label><Input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} placeholder="mentor@example.com" className="rounded-xl" /></div>
              <div className="space-y-2"><Label className="font-bold">Phone</Label><Input value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} placeholder="+91 ..." className="rounded-xl" /></div>
            </div>
            <div className="space-y-2"><Label className="font-bold">Bio / About You</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell mentees about your experience..." rows={3} className="rounded-xl" /></div>
            <Button type="submit" className="rounded-2xl font-bold shadow-card">Register as Mentor</Button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mentors..." className="pl-10 rounded-2xl shadow-card border-border/40" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeFilter === cat ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading mentors...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No mentors found. Be the first to register!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mentor) => (
            <div key={mentor.id} className="card-glow p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2 flex-wrap">
                    <span className="cursor-pointer hover:underline" onClick={() => navigate(`/profile/${mentor.user_id}`)}>{mentor.name}</span>
                    {mentor.is_verified && <VerifiedBadge />}
                    {isMentorComplete(mentor) && <VerifiedBadge ai />}
                  </h3>
                  <span className="text-xs bg-accent/20 text-accent-foreground px-2.5 py-0.5 rounded-full font-bold">{mentor.category}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold">
                  <Star className="w-3 h-3 text-primary" />
                  {mentor.experience_years}y
                </div>
              </div>
              <p className="text-sm font-bold text-primary">{mentor.expertise}</p>
              {mentor.bio && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{mentor.bio}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {mentor.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{mentor.location}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mentor.availability}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border/30">
                {mentor.contact_email && (
                  <a href={`mailto:${mentor.contact_email}`} className="flex items-center gap-1 text-xs text-primary hover:underline font-bold">
                    <Mail className="w-3 h-3" />Email
                  </a>
                )}
                {mentor.contact_phone && (
                  <a href={`tel:${mentor.contact_phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline font-bold">
                    <Phone className="w-3 h-3" />Call
                  </a>
                )}
                {user && user.id !== mentor.user_id && (
                  <button onClick={() => navigate(`/messages?with=${mentor.user_id}`)} className="flex items-center gap-1 text-xs text-primary hover:underline font-bold ml-auto">
                    <MessageCircle className="w-3 h-3" />Message
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorsPage;
