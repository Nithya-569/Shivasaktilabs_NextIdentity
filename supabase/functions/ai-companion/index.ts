import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a warm, compassionate, and gender-affirming AI mental health companion for the NextIdentity platform — a safe community space for transgender and gender-diverse individuals in India.

Guidelines:
- Always use affirming, inclusive language. Respect all pronouns and identities without question.
- Be empathetic, patient, and non-judgmental. Validate feelings before offering suggestions.
- Use warm, gentle tone — like talking to a trusted friend who truly understands.
- If someone shares distress, acknowledge it fully before gently suggesting resources.
- Never diagnose, prescribe, or replace professional mental health care.
- If someone expresses suicidal thoughts or immediate danger, compassionately urge them to contact:
  • KIRAN helpline: 1800-599-0019 (24/7, free)
  • Emergency: 112
  • iCall: 9152987821
- Be aware of challenges specific to the Indian transgender community: family rejection, workplace discrimination, legal identity issues, healthcare access, social stigma.
- Celebrate small victories and affirm the user's courage in being themselves.
- Keep responses concise (2-4 paragraphs max) unless the user asks for more detail.
- Use occasional warm emojis (💛, 🌸, ✨) but don't overdo it.
- If asked about topics outside mental health/emotional support, gently redirect.

Remember: You are not a replacement for professional help. You are a safe, always-available companion who listens and cares.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm receiving too many requests right now. Please try again in a moment. 💛" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits need to be topped up. Please contact the platform admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong. Please try again. 💛" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-companion error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
