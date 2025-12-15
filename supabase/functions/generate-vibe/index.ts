import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

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
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Received request:', { type, promptLength: prompt?.length, historyLength: history?.length });

    // Use different models for different tasks
    const model = type === 'random' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
    
    let messages;
    if (type === 'random') {
      messages = [
        {
          role: 'user',
          parts: [{ text: 'Generate a creative, unexpected web app idea in one sentence. Be creative and specific. Examples: "A playable Flappy Bird clone with neon graphics", "An interactive solar system explorer", "A recipe finder with drag-and-drop ingredients". Just respond with the idea, nothing else.' }]
        }
      ];
    } else {
      const conversationHistory = history?.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })) || [];

      messages = [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];
    }

    console.log('Calling Gemini API with model:', model);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        systemInstruction: type === 'random' ? undefined : { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: type === 'random' ? 1.2 : 0.7,
          maxOutputTokens: type === 'random' ? 100 : 8192,
          responseMimeType: type === 'random' ? 'text/plain' : 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error('No content in Gemini response:', JSON.stringify(data));
      throw new Error('No content in Gemini response');
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
      console.error('Failed to parse Gemini response as JSON:', content);
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Gemini');
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
