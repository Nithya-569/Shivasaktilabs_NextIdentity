import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, GraduationCap, MessageCircle, Briefcase, Sparkles } from "lucide-react";

interface PublicProfile {
  user_id: string;
  name: string | null;
  preferred_pronouns: string | null;
  location: string | null;
  skills: string[] | null;
  education: string | null;
  work_interests: string[] | null;
  personal_story: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      setProfile(data as PublicProfile | null);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="container max-w-2xl py-16 text-center text-muted-foreground">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-2xl py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
        <p className="text-muted-foreground">This user doesn't have a profile yet.</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <div className="container max-w-2xl py-8 px-4 pb-24 md:pb-8">
      <Card className="shadow-soft">
        <CardHeader className="items-center text-center pb-2">
          <Avatar className="h-28 w-28 border-2 border-border mb-3">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || "User"} />
            <AvatarFallback className="text-3xl bg-muted text-muted-foreground">
              {profile.name ? profile.name[0]?.toUpperCase() : <User size={40} />}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{profile.name || "Anonymous User"}</CardTitle>
          {profile.preferred_pronouns && (
            <p className="text-sm text-muted-foreground">({profile.preferred_pronouns})</p>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Location & Education */}
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            {profile.education && (
              <span className="flex items-center gap-1">
                <GraduationCap size={14} /> {profile.education}
              </span>
            )}
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Sparkles size={14} /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Work Interests */}
          {profile.work_interests && profile.work_interests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Briefcase size={14} /> Work Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.work_interests.map((interest) => (
                  <Badge key={interest} variant="outline">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Personal Story */}
          {profile.personal_story && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">About</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.personal_story}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {!isOwnProfile && user && (
              <Button
                className="flex-1"
                onClick={() => navigate(`/messages?with=${profile.user_id}`)}
              >
                <MessageCircle size={16} className="mr-2" /> Message
              </Button>
            )}
            {isOwnProfile && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicProfilePage;
