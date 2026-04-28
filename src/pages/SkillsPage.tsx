import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, ArrowRight, Plus, X, Loader2, Trash2, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  user_id: string;
  title: string;
  provider: string;
  duration: string;
  description: string | null;
  icon: string;
  category: string;
  created_at: string;
  enrollment_count?: number;
  is_enrolled?: boolean;
}

const icons = ["✂️", "💻", "💄", "🍳", "🎨", "🚀", "📚", "🎓"];
const courseCategories = ["General", "Digital Skills", "Beauty", "Cooking", "Tailoring", "Handicrafts", "Business", "Art"];

const SkillsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [form, setForm] = useState({ title: "", provider: "", duration: "", description: "", icon: "📚", category: "General" });

  const fetchCourses = async () => {
    const { data: coursesData } = await (supabase as any).from("courses").select("*").order("created_at", { ascending: false });
    if (!coursesData) { setLoading(false); return; }
    const { data: enrollments } = await (supabase as any).from("course_enrollments").select("course_id");
    const enriched = (coursesData as any[]).map((c) => ({
      ...c, enrollment_count: 0,
      is_enrolled: user ? (enrollments || []).some((e: any) => e.course_id === c.id) : false,
    }));
    for (const course of enriched) {
      const { count } = await (supabase as any).from("course_enrollments").select("*", { count: "exact", head: true }).eq("course_id", course.id);
      course.enrollment_count = count || 0;
    }
    setCourses(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await (supabase as any).from("courses").insert({
      user_id: user.id, title: form.title, provider: form.provider, duration: form.duration,
      description: form.description || null, icon: form.icon, category: form.category,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Course added! 🎉" }); setForm({ title: "", provider: "", duration: "", description: "", icon: "📚", category: "General" }); setShowForm(false); fetchCourses(); }
    setSubmitting(false);
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const course = courses.find((c) => c.id === courseId);
    if (course?.is_enrolled) {
      await (supabase as any).from("course_enrollments").delete().eq("user_id", user.id).eq("course_id", courseId);
      toast({ title: "Unenrolled" });
    } else {
      await (supabase as any).from("course_enrollments").insert({ user_id: user.id, course_id: courseId });
      toast({ title: "Enrolled! 🎉" });
    }
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("courses").delete().eq("id", id);
    fetchCourses();
  };

  const filteredCourses = courses.filter((c) => (activeFilter === "All" || c.category === activeFilter) && (!search || c.title.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black mb-1 text-foreground">Learn New Skills</h2>
            <p className="text-muted-foreground text-sm">Free training programs to build your future</p>
          </div>
          <Button onClick={() => { if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; } setShowForm(!showForm); }} className="rounded-2xl font-bold shadow-card">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span className="hidden sm:inline ml-1">{showForm ? "Cancel" : "Add Course"}</span>
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-3 shadow-card border border-border/40">
            <Search size={18} className="text-muted-foreground" />
            <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={16} className="text-muted-foreground shrink-0" />
          {["All", ...courseCategories].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeFilter === f ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}>
              {f}
            </button>
          ))}
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
            <form onSubmit={handleSubmit} className="card-glow p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Course Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
                <Input placeholder="Provider *" required value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="rounded-xl" />
                <Input placeholder="Duration *" required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="rounded-xl" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {courseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  {icons.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
              </div>
              <Button type="submit" disabled={submitting} className="rounded-2xl font-bold shadow-card">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <GraduationCap size={16} />}
                <span className="ml-1">{submitting ? "Adding..." : "Add Course"}</span>
              </Button>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card-glow p-6">
                <div className="flex justify-between items-start">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent/15 to-secondary/10 flex items-center justify-center text-xl mb-4 shadow-soft">{course.icon}</div>
                  {user && user.id === course.user_id && (
                    <button onClick={() => handleDelete(course.id)} className="text-destructive hover:text-destructive/80 p-1"><Trash2 size={14} /></button>
                  )}
                </div>
                <h3 className="text-base font-bold mb-1 text-foreground">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{course.provider}</p>
                {course.description && <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{course.description}</p>}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-semibold">
                  <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>
                  <span className="flex items-center gap-1"><Users size={12} />{course.enrollment_count} enrolled</span>
                </div>
                <button onClick={() => handleEnroll(course.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 font-bold rounded-2xl text-sm transition-all duration-300 ${
                    course.is_enrolled ? "bg-secondary/15 text-secondary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-soft"
                  }`}>
                  {course.is_enrolled ? "Enrolled ✓" : <>Join Course <ArrowRight size={14} /></>}
                </button>
              </motion.div>
            ))}
            {filteredCourses.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground text-sm">{search || activeFilter !== "All" ? "No courses match your filters." : "No courses yet. Add the first one! 📚"}</div>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SkillsPage;
