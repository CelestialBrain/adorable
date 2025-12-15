import { supabase } from "@/integrations/supabase/client";
import { GenerateVibeResponse } from "@/types";

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateVibe(
  prompt: string,
  history: HistoryMessage[]
): Promise<GenerateVibeResponse> {
  const { data, error } = await supabase.functions.invoke('generate-vibe', {
    body: { 
      prompt, 
      history: history.map(m => ({ role: m.role, content: m.content })),
      type: 'generate'
    }
  });

  if (error) {
    console.error('Error calling generate-vibe:', error);
    throw new Error(error.message || 'Failed to generate vibe');
  }

  if (data.error) {
    console.error('API error:', data.error);
    throw new Error(data.error);
  }

  return {
    thought: data.thought || '',
    html: data.html || '',
    title: data.title || 'Untitled'
  };
}

export async function generateRandomIdea(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-vibe', {
    body: { type: 'random' }
  });

  if (error) {
    console.error('Error calling generate-vibe for random idea:', error);
    throw new Error(error.message || 'Failed to generate random idea');
  }

  if (data.error) {
    console.error('API error:', data.error);
    throw new Error(data.error);
  }

  return data.idea || 'Build something amazing!';
}
