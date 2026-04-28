import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Profile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  updated_at: string;
  otherUser?: Profile;
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (!convos) return;

    // Get other user profiles
    const otherIds = convos.map((c) =>
      c.participant_one === user.id ? c.participant_two : c.participant_one
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url")
      .in("user_id", otherIds);

    // Get last message for each conversation
    const enriched = await Promise.all(
      convos.map(async (c) => {
        const otherUser = profiles?.find(
          (p) => p.user_id === (c.participant_one === user.id ? c.participant_two : c.participant_one)
        );
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        return {
          ...c,
          otherUser: otherUser || { user_id: "", name: "Unknown", avatar_url: null },
          lastMessage: lastMsg?.content || "",
          unreadCount: count || 0,
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle URL param for starting a new conversation
  useEffect(() => {
    const targetUserId = searchParams.get("with");
    if (targetUserId && user && targetUserId !== user.id) {
      startConversation(targetUserId);
      setSearchParams({});
    }
  }, [searchParams, user]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversation)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);

      // Mark as read
      if (user) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", activeConversation)
          .neq("sender_id", user.id)
          .eq("is_read", false);
      }
    };

    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`messages-${activeConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          // Mark as read if not sender
          if (user && newMsg.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, user]);

  const startConversation = async (otherUserId: string) => {
    if (!user) return;

    // Check if conversation exists (in either direction)
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`
      )
      .limit(1)
      .single();

    if (existing) {
      setActiveConversation(existing.id);
      setShowNewChat(false);
      return;
    }

    const { data: newConvo, error } = await supabase
      .from("conversations")
      .insert({ participant_one: user.id, participant_two: otherUserId })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Could not start conversation", variant: "destructive" });
      return;
    }

    setActiveConversation(newConvo.id);
    setShowNewChat(false);
    loadConversations();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user || sending) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversation,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } else {
      setNewMessage("");
      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversation);
    }
    setSending(false);
  };

  const searchUsers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url")
      .ilike("name", `%${query}%`)
      .neq("user_id", user?.id || "")
      .limit(10);
    setSearchResults(data || []);
  };

  const activeConvo = conversations.find((c) => c.id === activeConversation);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Sign in to use Messages</h2>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm" style={{ height: "calc(100vh - 8rem)" }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div
              className={`w-full md:w-80 border-r border-border flex flex-col ${
                activeConversation ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Messages</h2>
                <Button size="icon" variant="ghost" onClick={() => setShowNewChat(!showNewChat)}>
                  <Plus size={20} />
                </Button>
              </div>

              {showNewChat && (
                <div className="p-3 border-b border-border space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => searchUsers(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {searchResults.map((p) => (
                    <button
                      key={p.user_id}
                      onClick={() => startConversation(p.user_id)}
                      className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(p.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{p.name || "Anonymous"}</span>
                    </button>
                  ))}
                </div>
              )}

              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground">Tap + to start a new chat</p>
                  </div>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConversation(c.id)}
                      className={`flex items-center gap-3 w-full p-4 hover:bg-muted/50 transition-colors border-b border-border/50 ${
                        activeConversation === c.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <Avatar
                        className="h-10 w-10 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); c.otherUser?.user_id && navigate(`/profile/${c.otherUser.user_id}`); }}
                      >
                        <AvatarImage src={c.otherUser?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(c.otherUser?.name || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-foreground truncate">
                            {c.otherUser?.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(c.updated_at), "MMM d")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{c.lastMessage || "No messages yet"}</p>
                      </div>
                      {(c.unreadCount ?? 0) > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div
              className={`flex-1 flex flex-col ${
                !activeConversation ? "hidden md:flex" : "flex"
              }`}
            >
              {activeConversation && activeConvo ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="md:hidden"
                      onClick={() => setActiveConversation(null)}
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    <Avatar
                      className="h-9 w-9 cursor-pointer"
                      onClick={() => activeConvo.otherUser?.user_id && navigate(`/profile/${activeConvo.otherUser.user_id}`)}
                    >
                      <AvatarImage src={activeConvo.otherUser?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(activeConvo.otherUser?.name || null)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="font-semibold text-foreground cursor-pointer hover:underline"
                      onClick={() => activeConvo.otherUser?.user_id && navigate(`/profile/${activeConvo.otherUser.user_id}`)}
                    >
                      {activeConvo.otherUser?.name || "Anonymous"}
                    </span>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isMine = msg.sender_id === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isMine
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {format(new Date(msg.created_at), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        disabled={sending}
                      />
                      <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                        <Send size={18} />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground font-medium">Select a conversation</p>
                    <p className="text-sm text-muted-foreground">or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
