import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are a safety moderator for a supportive LGBTQ+ / trans community space in India.
Flag content that contains:
- Hate speech, slurs, transphobia, homophobia, misgendering attacks
- Harassment or targeted insults
- Explicit threats, doxxing, sexual content involving minors
- Spam, scams, or promotional links
DO NOT flag:
- Vulnerable sharing about mental health, struggles, dysphoria, coming out
- Strong emotional language about personal pain
- Discussion of discrimination experienced by the author
- Reclaimed terms used by the community about themselves
Be lenient — this is a safe space for vulnerable expression.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Moderate this post:\n\n"""${content}"""` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "moderate",
            description: "Return moderation decision",
            parameters: {
              type: "object",
              properties: {
                is_safe: { type: "boolean", description: "true if safe to publish" },
                reason: { type: "string", description: "short reason if flagged, empty if safe" },
              },
              required: ["is_safe", "reason"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "moderate" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ is_safe: true, reason: "" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ is_safe: true, reason: "" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { is_safe: true, reason: "" };

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("moderate error", e);
    return new Response(JSON.stringify({ is_safe: true, reason: "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
