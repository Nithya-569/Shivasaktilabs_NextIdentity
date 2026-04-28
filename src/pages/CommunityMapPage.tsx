import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Building2, GraduationCap, Heart, X, Loader2, Trash2, ExternalLink, Phone } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const categoryConfig = {
  business: { label: "Business", icon: Building2, color: "hsl(var(--primary))", emoji: "🏪" },
  training_center: { label: "Training Center", icon: GraduationCap, color: "hsl(var(--accent))", emoji: "🎓" },
  ngo: { label: "NGO", icon: Heart, color: "hsl(var(--secondary))", emoji: "💜" },
} as const;

type Category = keyof typeof categoryConfig;

interface MapLocation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: Category;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  created_at: string;
}

const createCategoryIcon = (category: Category) => {
  const config = categoryConfig[category];
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${config.color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${config.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Geocode address or PIN to coordinates using OpenStreetMap Nominatim
const getCoordinatesFromAddress = async (address: string) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await res.json();

    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
};

// Extract coordinates directly from full Google Maps URL
const extractCoordsFromGoogleMaps = (url: string) => {
  try {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) return null;

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  } catch {
    return null;
  }
};

// Resolve short Google Maps URL to full URL
const resolveShortGoogleMapsUrl = async (url: string) => {
  try {
    const res = await fetch(url, { method: "GET" });
    return res.url;
  } catch {
    return null;
  }
};

function LocationPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const CommunityMapPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "business" as Category,
    address: "",
    phone: "",
    website: "",
  });

  const fetchLocations = async () => {
    const { data, error } = await supabase.from("map_locations").select("*").order("created_at", { ascending: false });
    if (!error && data) setLocations(data as MapLocation[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();

    const channel = supabase
      .channel("map_locations_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "map_locations" }, () => {
        fetchLocations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to add a location.", variant: "destructive" });
      return;
    }

    // Priority-based location detection
    let coords = pickedCoords;

    if (!coords) {
      // Check if Google Maps link is provided
      if (form.website && form.website.includes("maps")) {
        toast({ title: "Processing...", description: "Extracting location from Google Maps link..." });
        
        let finalUrl = form.website;
        
        // If short link, resolve to full URL
        if (form.website.includes("maps.app.goo.gl")) {
          const resolved = await resolveShortGoogleMapsUrl(form.website);
          if (resolved) {
            finalUrl = resolved;
          }
        }

        // Try to extract coordinates from the URL
        coords = extractCoordsFromGoogleMaps(finalUrl);
      }

      // Fallback to address geocoding if no coords found
      if (!coords) {
        toast({ title: "Geocoding...", description: "Converting address to coordinates..." });
        coords = await getCoordinatesFromAddress(form.address);
      }

      // Final check: if still no coords, show error
      if (!coords) {
        toast({ title: "Could not determine location", description: "Please click on the map to set the location, or provide a valid address.", variant: "destructive" });
        return;
      }

      setPickedCoords(coords);
    }

    setSubmitting(true);
    const { error } = await supabase.from("map_locations").insert({
      user_id: user.id,
      name: form.name,
      description: form.description || null,
      category: form.category,
      address: form.address,
      latitude: coords.lat,
      longitude: coords.lng,
      phone: form.phone || null,
      website: form.website || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Location added!", description: `${form.name} has been added to the map.` });
      setForm({ name: "", description: "", category: "business", address: "", phone: "", website: "" });
      setPickedCoords(null);
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("map_locations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Location removed from the map." });
    }
  };

  const filtered = filterCategory === "all" ? locations : locations.filter((l) => l.category === filterCategory);

  return (
    <div>
      <div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Community Map</h1>
              <p className="text-muted-foreground text-sm">Discover trans-run businesses, training centers & NGOs</p>
            </div>
            <Button
              onClick={() => {
                if (!user) {
                  toast({ title: "Please sign in", description: "You need an account to add locations.", variant: "destructive" });
                  return;
                }
                setShowForm(!showForm);
              }}
              className="rounded-xl shadow-sm"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              <span className="hidden sm:inline">{showForm ? "Cancel" : "Add Location"}</span>
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {(Object.keys(categoryConfig) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  filterCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {categoryConfig[cat].emoji} {categoryConfig[cat].label}
              </button>
            ))}
          </div>

          {/* Add Location Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
                <p className="text-sm font-medium text-foreground mb-1">📍 Click on the map to set the pin, then fill the details:</p>
                {pickedCoords && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {pickedCoords.lat.toFixed(4)}, {pickedCoords.lng.toFixed(4)}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="business">🏪 Business</option>
                    <option value="training_center">🎓 Training Center</option>
                    <option value="ngo">💜 NGO</option>
                  </select>
                  <Input placeholder="Address *" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="sm:col-span-2" />
                  <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Input placeholder="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="sm:col-span-2" />
                </div>
                <Button type="submit" disabled={submitting} className="rounded-xl w-full sm:w-auto">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                  {submitting ? "Adding..." : "Add to Map"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-border" style={{ height: "55vh", minHeight: 350 }}>
            {loading ? (
              <div className="flex items-center justify-center h-full bg-muted">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full z-0">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {showForm && <LocationPicker onPick={(lat, lng) => setPickedCoords({ lat, lng })} />}
                {pickedCoords && showForm && (
                  <Marker position={[pickedCoords.lat, pickedCoords.lng]}>
                    <Popup>New location pin</Popup>
                  </Marker>
                )}
                {filtered.map((loc) => (
                  <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={createCategoryIcon(loc.category)}>
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-semibold text-sm">{categoryConfig[loc.category].emoji} {loc.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-full">{categoryConfig[loc.category].label}</span>
                        {loc.description && <p className="text-xs mt-1 text-gray-600">{loc.description}</p>}
                        <p className="text-xs text-gray-500 mt-1">📍 {loc.address}</p>
                        {loc.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={10} />{loc.phone}</p>}
                        {loc.website && (
                          <a href={loc.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                            <ExternalLink size={10} /> Website
                          </a>
                        )}
                        {user && user.id === loc.user_id && (
                          <button
                            onClick={() => handleDelete(loc.id)}
                            className="mt-2 text-xs text-red-500 flex items-center gap-1 hover:underline"
                          >
                            <Trash2 size={10} /> Delete
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Location List */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((loc, i) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-start gap-3"
              >
                <div className="text-2xl">{categoryConfig[loc.category].emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">{loc.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">
                    {categoryConfig[loc.category].label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1 truncate">📍 {loc.address}</p>
                  {loc.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={10} />{loc.phone}</p>}
                  {loc.website && (
                    <a href={loc.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline">
                      <ExternalLink size={10} /> Visit
                    </a>
                  )}
                </div>
                {user && user.id === loc.user_id && (
                  <button onClick={() => handleDelete(loc.id)} className="text-destructive hover:text-destructive/80 p-1">
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                No locations found. Be the first to add one!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityMapPage;
