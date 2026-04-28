import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, Plus, X, Loader2, Trash2, Search, Filter, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  rating: number;
  created_at: string;
  is_wishlisted?: boolean;
}

const productCategories = ["Handicrafts", "Food", "Clothing", "Artwork", "Accessories", "General"];

const MarketplacePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "General", image_url: "" });

  const fetchProducts = async () => {
    const { data } = await (supabase as any).from("marketplace_products").select("*").order("created_at", { ascending: false });
    if (!data) { setLoading(false); return; }

    let wishlistIds: string[] = [];
    if (user) {
      const { data: wl } = await (supabase as any).from("wishlists").select("product_id").eq("user_id", user.id);
      wishlistIds = (wl || []).map((w: any) => w.product_id);
    }

    setProducts((data as any[]).map((p) => ({ ...p, is_wishlisted: wishlistIds.includes(p.id) })));
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    const channel = supabase.channel("products_rt").on("postgres_changes", { event: "*", schema: "public", table: "marketplace_products" }, () => fetchProducts()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: publicUrl }));
      setPreviewUrl(publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await (supabase as any).from("marketplace_products").insert({
      user_id: user.id, name: form.name, price: parseFloat(form.price),
      description: form.description || null, category: form.category, image_url: form.image_url || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Product listed!" });
      setForm({ name: "", price: "", description: "", category: "General", image_url: "" });
      setPreviewUrl(null);
      setShowForm(false);
    }
    setSubmitting(false);
  };


  const handleWishlist = async (productId: string) => {
    if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
    const p = products.find((x) => x.id === productId);
    if (p?.is_wishlisted) {
      await (supabase as any).from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      toast({ title: "Removed from wishlist" });
    } else {
      await (supabase as any).from("wishlists").insert({ user_id: user.id, product_id: productId });
      toast({ title: "Added to wishlist!" });
    }
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("marketplace_products").delete().eq("id", id);
  };

  return (
    <div>
      <div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Marketplace</h1>
              <p className="text-muted-foreground text-sm">Support transgender entrepreneurs — shop with purpose</p>
            </div>
            <Button onClick={() => { if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; } setShowForm(!showForm); }} className="rounded-xl">
              {showForm ? <X size={16} /> : <Plus size={16} />}
              <span className="hidden sm:inline ml-1">{showForm ? "Cancel" : "List Product"}</span>
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-card rounded-xl px-4 py-3 shadow-sm border border-border">
              <Search size={18} className="text-muted-foreground" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Filter size={16} className="text-muted-foreground shrink-0" />
            {["All", ...productCategories].map((f) => (
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
                  <Input placeholder="Product Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input placeholder="Price (₹) *" required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {productCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                      <span className="ml-1">{uploading ? "Uploading..." : previewUrl ? "Change Photo" : "Add Photo"}</span>
                    </Button>
                    {previewUrl && <img src={previewUrl} alt="Preview" className="h-10 w-10 rounded-md object-cover border border-border" />}
                  </div>
                  <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2" />
                </div>
                <Button type="submit" disabled={submitting} className="rounded-xl">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                  <span className="ml-1">{submitting ? "Listing..." : "List Product"}</span>
                </Button>
              </form>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter((p) => (activeFilter === "All" || p.category === activeFilter) && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase()))).map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-muted flex items-center justify-center relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={40} className="text-muted-foreground/30" />
                    )}
                    {user && user.id === product.user_id && (
                      <button onClick={() => handleDelete(product.id)}
                        className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 text-destructive hover:text-destructive/80">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">{product.name}</h3>
                    {product.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{product.description}</p>}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-foreground">₹{product.price}</span>
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{product.category}</span>
                    </div>
                    <button onClick={() => handleWishlist(product.id)}
                      className={`w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                        product.is_wishlisted ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}>
                      <Heart size={12} className={product.is_wishlisted ? "fill-current" : ""} />
                      {product.is_wishlisted ? "Wishlisted ♥" : "Add to Wishlist"}
                    </button>
                  </div>
                </motion.div>
              ))}
              {products.filter((p) => (activeFilter === "All" || p.category === activeFilter) && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase()))).length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground text-sm">{search || activeFilter !== "All" ? "No products match your filters." : "No products yet. List the first one!"}</div>}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MarketplacePage;
