import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, MapPin, ShoppingBag, Calendar, Briefcase, BookOpen, Award, CheckCircle, XCircle, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Data states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState({ profiles: 0, communities: 0, events: 0, jobs: 0, products: 0, mentors: 0, locations: 0 });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    checkAdminRole();
  }, [user]);

  const checkAdminRole = async () => {
    const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
    if (data) {
      setIsAdmin(true);
      fetchAllData();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const [profilesRes, communitiesRes, eventsRes, jobsRes, productsRes, mentorsRes, locationsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("communities").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("events").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("jobs").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("marketplace_products").select("*").order("created_at", { ascending: false }),
      supabase.from("mentors").select("*").order("created_at", { ascending: false }),
      supabase.from("map_locations").select("*").order("created_at", { ascending: false }),
    ]);

    setProfiles(profilesRes.data || []);
    setCommunities(communitiesRes.data || []);
    setEvents(eventsRes.data || []);
    setJobs(jobsRes.data || []);
    setProducts(productsRes.data || []);
    setMentors(mentorsRes.data || []);
    setLocations(locationsRes.data || []);
    setStats({
      profiles: (profilesRes.data || []).length,
      communities: (communitiesRes.data || []).length,
      events: (eventsRes.data || []).length,
      jobs: (jobsRes.data || []).length,
      products: (productsRes.data || []).length,
      mentors: (mentorsRes.data || []).length,
      locations: (locationsRes.data || []).length,
    });
    setLoading(false);
  };

  const handleVerifyProfile = async (profileId: string, verified: boolean) => {
    await supabase.from("profiles").update({ is_verified: verified }).eq("id", profileId);
    toast({ title: verified ? "Profile verified ✅" : "Verification removed" });
    fetchAllData();
  };

  const handleVerifyMentor = async (mentorId: string, verified: boolean) => {
    await supabase.from("mentors").update({ is_verified: verified }).eq("id", mentorId);
    toast({ title: verified ? "Mentor verified ✅" : "Verification removed" });
    fetchAllData();
  };

  const handleApproveCommunity = async (id: string, approved: boolean) => {
    await (supabase as any).from("communities").update({ is_approved: approved }).eq("id", id);
    toast({ title: approved ? "Community approved ✅" : "Community unapproved" });
    fetchAllData();
  };

  const handleApproveEvent = async (id: string, approved: boolean) => {
    await (supabase as any).from("events").update({ is_approved: approved }).eq("id", id);
    toast({ title: approved ? "Event approved ✅" : "Event unapproved" });
    fetchAllData();
  };

  const handleApproveJob = async (id: string, approved: boolean) => {
    await (supabase as any).from("jobs").update({ is_approved: approved }).eq("id", id);
    toast({ title: approved ? "Job approved ✅" : "Job unapproved" });
    fetchAllData();
  };

  const handleVerifyProduct = async (id: string, verified: boolean) => {
    await (supabase as any).from("marketplace_products").update({ is_verified: verified }).eq("id", id);
    toast({ title: verified ? "Product verified ✅" : "Verification removed" });
    fetchAllData();
  };

  const handleDeleteItem = async (table: string, id: string) => {
    await (supabase as any).from(table).delete().eq("id", id);
    toast({ title: "Item removed" });
    fetchAllData();
  };

  const filterBySearch = (items: any[], keys: string[]) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item => keys.some(k => item[k]?.toString().toLowerCase().includes(q)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground mb-4">Please sign in to access the admin dashboard.</p>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have admin privileges. Contact a platform administrator.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage and moderate TransConnect India platform</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { label: "Profiles", value: stats.profiles, icon: Users },
            { label: "Communities", value: stats.communities, icon: Users },
            { label: "Events", value: stats.events, icon: Calendar },
            { label: "Jobs", value: stats.jobs, icon: Briefcase },
            { label: "Products", value: stats.products, icon: ShoppingBag },
            { label: "Mentors", value: stats.mentors, icon: Award },
            { label: "Locations", value: stats.locations, icon: MapPin },
          ].map(s => (
            <Card key={s.label} className="text-center">
              <CardContent className="p-3">
                <s.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search across all content..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Tabs defaultValue="profiles" className="space-y-4">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
            <TabsTrigger value="profiles" className="text-xs">Profiles</TabsTrigger>
            <TabsTrigger value="communities" className="text-xs">Communities</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
            <TabsTrigger value="products" className="text-xs">Products</TabsTrigger>
            <TabsTrigger value="mentors" className="text-xs">Mentors</TabsTrigger>
            <TabsTrigger value="locations" className="text-xs">Locations</TabsTrigger>
          </TabsList>

          {/* Profiles */}
          <TabsContent value="profiles">
            <div className="space-y-3">
              {filterBySearch(profiles, ["name", "location", "education"]).map(p => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{p.name || "Unnamed"}</span>
                        {p.is_verified && <VerifiedBadge />}
                      </div>
                      <div className="text-sm text-muted-foreground">{p.location || "No location"} · {p.preferred_pronouns || "No pronouns set"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.skills?.join(", ") || "No skills listed"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={p.is_verified ? "outline" : "default"} onClick={() => handleVerifyProfile(p.id, !p.is_verified)}>
                        {p.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communities */}
          <TabsContent value="communities">
            <div className="space-y-3">
              {filterBySearch(communities, ["name", "category"]).map(c => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-lg mr-2">{c.emoji}</span>
                      <span className="font-semibold text-foreground">{c.name}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{c.category}</span>
                      {c.is_approved && <span className="ml-2 text-xs text-primary">✅ Approved</span>}
                      <p className="text-sm text-muted-foreground mt-1">{c.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={c.is_approved ? "outline" : "default"} onClick={() => handleApproveCommunity(c.id, !c.is_approved)}>
                        {c.is_approved ? "Unapprove" : "Approve"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItem("communities", c.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events">
            <div className="space-y-3">
              {filterBySearch(events, ["title", "type", "location"]).map(e => (
                <Card key={e.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-lg mr-2">{e.emoji}</span>
                      <span className="font-semibold text-foreground">{e.title}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{e.type}</span>
                      <p className="text-sm text-muted-foreground mt-1">{e.location} · {e.event_date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={e.is_approved ? "outline" : "default"} onClick={() => handleApproveEvent(e.id, !e.is_approved)}>
                        {e.is_approved ? "Unapprove" : "Approve"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItem("events", e.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Jobs */}
          <TabsContent value="jobs">
            <div className="space-y-3">
              {filterBySearch(jobs, ["title", "company", "location"]).map(j => (
                <Card key={j.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">{j.title}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{j.type}</span>
                      <p className="text-sm text-muted-foreground mt-1">{j.company} · {j.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={j.is_approved ? "outline" : "default"} onClick={() => handleApproveJob(j.id, !j.is_approved)}>
                        {j.is_approved ? "Unapprove" : "Approve"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItem("jobs", j.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products">
            <div className="space-y-3">
              {filterBySearch(products, ["name", "category"]).map(p => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {p.image_url && <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />}
                      <div>
                        <span className="font-semibold text-foreground">{p.name}</span>
                        {p.is_verified && <VerifiedBadge />}
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{p.category}</span>
                        <p className="text-sm text-muted-foreground">₹{p.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={p.is_verified ? "outline" : "default"} onClick={() => handleVerifyProduct(p.id, !p.is_verified)}>
                        {p.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItem("marketplace_products", p.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mentors */}
          <TabsContent value="mentors">
            <div className="space-y-3">
              {filterBySearch(mentors, ["name", "expertise", "category"]).map(m => (
                <Card key={m.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{m.name}</span>
                        {m.is_verified && <VerifiedBadge />}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{m.category}</span>
                      <p className="text-sm text-muted-foreground mt-1">{m.expertise} · {m.experience_years} yrs</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={m.is_verified ? "outline" : "default"} onClick={() => handleVerifyMentor(m.id, !m.is_verified)}>
                        {m.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItem("mentors", m.id)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Locations */}
          <TabsContent value="locations">
            <div className="space-y-3">
              {filterBySearch(locations, ["name", "address", "category"]).map(l => (
                <Card key={l.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">{l.name}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{l.category}</span>
                      <p className="text-sm text-muted-foreground mt-1">{l.address}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteItem("map_locations", l.id)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
