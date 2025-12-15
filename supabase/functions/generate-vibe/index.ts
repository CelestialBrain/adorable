import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const systemPrompt = `You are a Senior Creative Technologist and full-stack prototype generator. Your job is to take a user's description and generate a complete, working HTML/CSS/JS prototype.

CRITICAL RULES:
1. PRIORITIZE LOGIC: If building a game, WRITE THE ACTUAL JS GAME LOOP using Canvas and requestAnimationFrame. NO CSS-only fakes or illusions.
2. ALLOWED TECH: You may use CDNs for:
   - Leaflet (maps)
   - Chart.js (data visualization)
   - Three.js (3D graphics)
3. VISUAL DESIGN: Use Bento Grids and asymmetric layouts. NEVER stack boring boxes.
4. IMAGES: Always use https://image.pollinations.ai/prompt/{description} for any images.
5. OUTPUT: Always return a complete <!DOCTYPE html> document with inline CSS and JS.
6. FONTS: Include Google Fonts (Inter, Playfair Display, JetBrains Mono) via CDN.
7. STYLING: Use Tailwind CSS via CDN for rapid styling.

You must respond with valid JSON in this exact format:
{
  "thought": "Your thought process explaining what you're building and why",
  "html": "The complete HTML document as a string",
  "title": "A short title for this page"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, history, type } = await req.json();
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Received request:', { type, promptLength: prompt?.length, historyLength: history?.length });

    let messages;
    if (type === 'random') {
      messages = [
        {
          role: 'system',
          content: 'Generate a creative, unexpected web app idea in one sentence. Be creative and specific. Examples: "A playable Flappy Bird clone with neon graphics", "An interactive solar system explorer", "A recipe finder with drag-and-drop ingredients". Just respond with the idea, nothing else.'
        },
        {
          role: 'user',
          content: 'Give me a random creative web app idea.'
        }
      ];
    } else {
      const conversationHistory = history?.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })) || [];

      messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: prompt }
      ];
    }

    console.log('Calling Lovable AI Gateway');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: type === 'random' ? 1.2 : 0.7,
        max_tokens: type === 'random' ? 100 : 8192,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage credits exhausted. Please add credits in Settings -> Workspace -> Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Lovable AI Gateway response received');

    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in response:', JSON.stringify(data));
      throw new Error('No content in AI response');
    }

    if (type === 'random') {
      return new Response(JSON.stringify({ idea: content.trim() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the JSON response for vibe generation
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse response as JSON:', content);
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-vibe function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
