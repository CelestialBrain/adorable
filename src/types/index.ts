export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  timestamp: Date;
}

export interface Page {
  id: string;
  title: string;
  html: string;
}

export interface Template {
  id: string;
  title: string;
  icon: string;
  prompt: string;
}

export interface GenerationResult {
  thought: string;
  response: string;
  pages: Page[];
}

export interface GenerateVibeResponse {
  thought: string;
  html: string;
  title: string;
}
