import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Search, Plus, X, Loader2, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import VerifiedBadge from "@/components/VerifiedBadge";

interface Job {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  description: string | null;
  verified: boolean;
  created_at: string;
}

const jobTypes = ["Full-time", "Part-time", "Remote", "Freelance", "Apprenticeship"];
const jobCategories = ["Corporate", "Skill-based", "Entry-level", "Digital", "Apprenticeship"];
const jobLocations = ["All Locations", "Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Pune", "Remote"];

const isComplete = (job: Job) => !!(job.title && job.company && job.location && job.description);

const JobsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All Locations");

  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "Full-time", category: "Corporate", description: "",
  });

  const fetchJobs = async () => {
    const { data } = await (supabase as any).from("jobs").select("*").order("created_at", { ascending: false });
    if (data) setJobs(data as Job[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const channel = supabase.channel("jobs_rt").on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => fetchJobs()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await (supabase as any).from("jobs").insert({
      user_id: user.id, title: form.title, company: form.company, location: form.location,
      type: form.type, category: form.category, description: form.description || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Job posted! 🎉" });
      setForm({ title: "", company: "", location: "", type: "Full-time", category: "Corporate", description: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from("jobs").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const filtered = jobs
    .filter((j) => filterCat === "All" || j.category === filterCat)
    .filter((j) => filterLocation === "All Locations" || j.location.toLowerCase().includes(filterLocation.toLowerCase()))
    .filter((j) => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black mb-1 text-foreground">Find Jobs</h2>
            <p className="text-muted-foreground text-sm">Inclusive opportunities from verified employers</p>
          </div>
          <Button onClick={() => { if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; } setShowForm(!showForm); }} className="rounded-2xl font-bold shadow-card">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span className="hidden sm:inline ml-1">{showForm ? "Cancel" : "Post Job"}</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-3 shadow-card border border-border/40">
            <Search size={18} className="text-muted-foreground" />
            <input type="text" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="mb-4">
          <div className="relative inline-block w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-2.5 shadow-card border border-border/40 cursor-pointer">
              <MapPin size={15} className="text-muted-foreground shrink-0" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-transparent outline-none text-sm text-foreground w-full sm:w-48 cursor-pointer appearance-none pr-6"
              >
                {jobLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown size={14} className="text-muted-foreground shrink-0 -ml-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["All", ...jobCategories].map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${filterCat === cat ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Add Job Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
            <form onSubmit={handleSubmit} className="card-glow p-5 space-y-3">
              <p className="text-sm font-black text-foreground">📝 Post a new job listing</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Job Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
                <Input placeholder="Company *" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="rounded-xl" />
                <Input placeholder="Location *" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-xl" />
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {jobCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Input placeholder="Description (improves AI verification)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
              </div>
              <Button type="submit" disabled={submitting} className="rounded-2xl font-bold shadow-card">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Briefcase size={16} />}
                <span className="ml-1">{submitting ? "Posting..." : "Post Job"}</span>
              </Button>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card-glow p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-soft">
                      <Briefcase size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isComplete(job) && <VerifiedBadge ai />}
                    {job.verified && <VerifiedBadge />}
                    {user && user.id === job.user_id && (
                      <button onClick={() => handleDelete(job.id)} className="text-destructive hover:text-destructive/80 p-1"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
                {job.description && <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{job.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{job.type}</span>
                  <span className="px-2.5 py-0.5 bg-muted/60 rounded-full font-semibold">{job.category}</span>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No jobs found. Be the first to post one! 💼</div>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JobsPage;
