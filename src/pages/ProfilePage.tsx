import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, MapPin, GraduationCap, Save, LogOut, Camera, Shield, Eye, EyeOff, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

interface Profile {
  name: string;
  preferred_pronouns: string;
  location: string;
  skills: string[];
  education: string;
  work_interests: string[];
  personal_story: string;
  avatar_url: string;
  is_public: boolean;
  hide_location: boolean;
  hide_personal_story: boolean;
  allow_messages: boolean;
}

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    preferred_pronouns: "",
    location: "",
    skills: [],
    education: "",
    work_interests: [],
    personal_story: "",
    avatar_url: "",
    is_public: true,
    hide_location: false,
    hide_personal_story: false,
    allow_messages: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Initialize as false — set true only while actually fetching.
  // If user is null, the effect returns early and fetching must NOT stay true forever.
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        const d = data as any;
        setProfile({
          name: d.name || "",
          preferred_pronouns: d.preferred_pronouns || "",
          location: d.location || "",
          skills: d.skills || [],
          education: d.education || "",
          work_interests: d.work_interests || [],
          personal_story: d.personal_story || "",
          avatar_url: d.avatar_url || "",
          is_public: d.is_public ?? true,
          hide_location: d.hide_location ?? false,
          hide_personal_story: d.hide_personal_story ?? false,
          allow_messages: d.allow_messages ?? true,
        });
      }
      setFetching(false);
    };
    fetchProfile();
  }, [user]);

  if (loading || fetching) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        name: profile.name || null,
        preferred_pronouns: profile.preferred_pronouns || null,
        location: profile.location || null,
        skills: profile.skills.length ? profile.skills : null,
        education: profile.education || null,
        work_interests: profile.work_interests.length ? profile.work_interests : null,
        personal_story: profile.personal_story || null,
        avatar_url: profile.avatar_url || null,
        is_public: profile.is_public,
        hide_location: profile.hide_location,
        hide_personal_story: profile.hide_personal_story,
        allow_messages: profile.allow_messages,
      })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved!", description: "Your profile has been updated." });
    }
  };

  const updateField = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: "skills" | "work_interests", value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value.split(",").map((s) => s.trim()).filter(Boolean),
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: newUrl }).eq("user_id", user.id);
    setProfile((prev) => ({ ...prev, avatar_url: newUrl }));
    setUploading(false);
    toast({ title: "Avatar updated!" });
  };

  return (
    <div className="container max-w-2xl py-8 px-4 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
          <LogOut size={16} className="mr-1" /> Sign Out
        </Button>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User size={20} /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={profile.avatar_url} alt="Profile avatar" />
                <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                  {profile.name ? profile.name[0]?.toUpperCase() : <User size={32} />}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={24} className="text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {uploading ? "Uploading…" : "Click avatar to change photo"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={profile.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pronouns">Preferred Pronouns</Label>
              <Input
                id="pronouns"
                placeholder="e.g., she/her, they/them"
                value={profile.preferred_pronouns}
                onChange={(e) => updateField("preferred_pronouns", e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin size={14} /> Location
              </Label>
              <Input
                id="location"
                placeholder="City, State"
                value={profile.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education" className="flex items-center gap-1">
                <GraduationCap size={14} /> Education
              </Label>
              <Input
                id="education"
                placeholder="Your education"
                value={profile.education}
                onChange={(e) => updateField("education", e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              placeholder="e.g., Tailoring, Cooking, Digital Marketing"
              value={profile.skills.join(", ")}
              onChange={(e) => updateArrayField("skills", e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Work Interests (comma-separated)</Label>
            <Input
              id="interests"
              placeholder="e.g., Restaurant, Beauty Salon, Tech"
              value={profile.work_interests.join(", ")}
              onChange={(e) => updateArrayField("work_interests", e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story">Personal Story</Label>
            <Textarea
              id="story"
              placeholder="Share a bit about yourself (optional)"
              value={profile.personal_story}
              onChange={(e) => updateField("personal_story", e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleSave} className="w-full h-12 text-base" disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield size={20} /> Privacy Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            {
              key: "is_public" as const,
              icon: profile.is_public ? Eye : EyeOff,
              title: "Public profile",
              desc: "When off, only you and admins can see your profile page.",
            },
            {
              key: "hide_location" as const,
              icon: MapPin,
              title: "Hide my location",
              desc: "Your location won't show on your public profile.",
              invert: true,
            },
            {
              key: "hide_personal_story" as const,
              icon: User,
              title: "Hide my personal story",
              desc: "Your story stays private even if your profile is public.",
              invert: true,
            },
            {
              key: "allow_messages" as const,
              icon: MessageCircle,
              title: "Allow direct messages",
              desc: "When off, others cannot start a conversation with you.",
            },
          ].map((row) => {
            const Icon = row.icon;
            const checked = row.invert ? !profile[row.key] : profile[row.key];
            return (
              <div key={row.key} className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{row.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{row.desc}</p>
                </div>
                <Switch
                  checked={checked}
                  onCheckedChange={(v) =>
                    setProfile((prev) => ({ ...prev, [row.key]: row.invert ? !v : v }))
                  }
                />
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground pt-3">
            💡 Don't forget to tap <strong>Save Profile</strong> above to apply these changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
