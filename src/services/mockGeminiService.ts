import { GenerationResult, Page } from '@/types';

// Mock service for initial UI testing - will be replaced with real Gemini integration
const randomIdeas = [
  "A futuristic dashboard for a space station with real-time orbit tracking and crew vitals",
  "An underwater research lab control panel with depth gauges and sonar displays",
  "A cyberpunk-themed music player with neon visualizations and glitch effects",
  "A vintage film camera e-commerce page with sepia tones and analog aesthetics",
  "A bioluminescent deep-sea creature encyclopedia with glowing animations",
  "A retro arcade game launcher with CRT scan lines and pixel art",
  "A minimalist weather app for pilots with altitude-based forecasts",
  "A steampunk-inspired task manager with gear animations and brass textures",
];

const mockHtmlTemplates: Record<string, string> = {
  saas: `
<div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
  <nav class="flex items-center justify-between px-8 py-6">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
        <span class="text-white font-bold">H</span>
      </div>
      <span class="text-white font-semibold">Hatable</span>
    </div>
    <div class="flex items-center gap-6">
      <a href="#features" class="text-gray-300 hover:text-white transition">Features</a>
      <a href="#pricing" class="text-gray-300 hover:text-white transition">Pricing</a>
      <button class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">Get Started</button>
    </div>
  </nav>
  
  <main class="px-8 py-20">
    <div class="max-w-4xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
        <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
        Now in Beta
      </div>
      <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
        Build apps with<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI superpowers</span>
      </h1>
      <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
        Describe your vision, watch it come to life. Hatable transforms your ideas into fully functional prototypes in seconds.
      </p>
      <div class="flex items-center justify-center gap-4">
        <button class="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition">
          Start Building Free
        </button>
        <button class="px-8 py-4 border border-gray-600 text-white rounded-xl hover:bg-gray-800 transition">
          Watch Demo
        </button>
      </div>
    </div>
    
    <div class="mt-20 grid grid-cols-3 gap-6 max-w-5xl mx-auto">
      <div class="col-span-2 bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <div class="text-4xl mb-4">🚀</div>
        <h3 class="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
        <p class="text-gray-400">Generate complete UIs in under 10 seconds with our optimized AI engine.</p>
      </div>
      <div class="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <div class="text-4xl mb-4">🎨</div>
        <h3 class="text-xl font-semibold text-white mb-2">Beautiful</h3>
        <p class="text-gray-400">Modern designs out of the box.</p>
      </div>
      <div class="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <div class="text-4xl mb-4">📱</div>
        <h3 class="text-xl font-semibold text-white mb-2">Responsive</h3>
        <p class="text-gray-400">Mobile-first by default.</p>
      </div>
      <div class="col-span-2 bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <div class="text-4xl mb-4">⚡</div>
        <h3 class="text-xl font-semibold text-white mb-2">Export Anywhere</h3>
        <p class="text-gray-400">Download clean HTML, React, or Vue components ready for production.</p>
      </div>
    </div>
  </main>
</div>
  `,
  dashboard: `
<div class="min-h-screen bg-gray-950 flex">
  <aside class="w-64 bg-gray-900 border-r border-gray-800 p-4">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
        <span class="text-white font-mono font-bold">&lt;/&gt;</span>
      </div>
      <span class="text-white font-semibold">DevHub</span>
    </div>
    <nav class="space-y-1">
      <a href="#" class="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
        <span>📊</span> Dashboard
      </a>
      <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
        <span>📁</span> Projects
      </a>
      <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
        <span>👥</span> Team
      </a>
      <a href="#" class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
        <span>⚙️</span> Settings
      </a>
    </nav>
  </aside>
  
  <main class="flex-1 p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Welcome back, Developer</h1>
        <p class="text-gray-400">Here's what's happening with your projects</p>
      </div>
      <button class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
        New Project
      </button>
    </div>
    
    <div class="grid grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p class="text-gray-400 text-sm mb-1">Total Projects</p>
        <p class="text-3xl font-bold text-white">24</p>
        <p class="text-emerald-400 text-sm mt-2">↑ 12% from last month</p>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p class="text-gray-400 text-sm mb-1">Active Deploys</p>
        <p class="text-3xl font-bold text-white">18</p>
        <p class="text-emerald-400 text-sm mt-2">↑ 8% from last month</p>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p class="text-gray-400 text-sm mb-1">Team Members</p>
        <p class="text-3xl font-bold text-white">7</p>
        <p class="text-gray-400 text-sm mt-2">+2 pending invites</p>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p class="text-gray-400 text-sm mb-1">API Calls</p>
        <p class="text-3xl font-bold text-white">1.2M</p>
        <p class="text-emerald-400 text-sm mt-2">↑ 24% from last month</p>
      </div>
    </div>
    
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Recent Activity</h2>
      <div class="space-y-4">
        <div class="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
          <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span>🚀</span>
          </div>
          <div class="flex-1">
            <p class="text-white">Deployed <span class="text-purple-400">e-commerce-app</span> to production</p>
            <p class="text-gray-400 text-sm">2 hours ago</p>
          </div>
        </div>
        <div class="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
          <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span>📝</span>
          </div>
          <div class="flex-1">
            <p class="text-white">Merged PR #142 in <span class="text-blue-400">landing-page</span></p>
            <p class="text-gray-400 text-sm">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
  `,
};

function generateMockPage(prompt: string): Page {
  const lowerPrompt = prompt.toLowerCase();
  let html = '';
  let title = 'Generated Page';

  if (lowerPrompt.includes('saas') || lowerPrompt.includes('landing')) {
    html = mockHtmlTemplates.saas;
    title = 'SaaS Landing';
  } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('dev')) {
    html = mockHtmlTemplates.dashboard;
    title = 'Dev Dashboard';
  } else {
    // Generate a simple page based on the prompt
    html = `
<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
  <div class="max-w-2xl text-center">
    <h1 class="text-4xl font-bold text-white mb-4">
      ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}
    </h1>
    <p class="text-gray-400 mb-8">
      This is a generated preview based on your prompt. Connect to Lovable Cloud to enable real AI generation.
    </p>
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div class="text-3xl mb-2">✨</div>
        <h3 class="text-white font-semibold">Feature One</h3>
        <p class="text-gray-400 text-sm mt-1">Amazing capability</p>
      </div>
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div class="text-3xl mb-2">🎯</div>
        <h3 class="text-white font-semibold">Feature Two</h3>
        <p class="text-gray-400 text-sm mt-1">Perfect accuracy</p>
      </div>
    </div>
  </div>
</div>
    `;
    title = 'Custom Page';
  }

  return {
    id: `page-${Date.now()}`,
    title,
    html,
  };
}

export async function generateVibe(
  prompt: string,
  _history: Array<{ role: string; content: string }>
): Promise<GenerationResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const page = generateMockPage(prompt);

  return {
    thought: `Analyzing the request: "${prompt.slice(0, 100)}..."\n\nI'll create a modern, responsive design with a dark theme. Using Tailwind CSS for styling and focusing on visual hierarchy and user experience.`,
    response: `I've generated a preview based on your description. The design includes:\n\n• Dark gradient background for a modern feel\n• Responsive grid layout\n• Interactive hover states\n• Clean typography hierarchy\n\nTo enable full AI generation with real functionality, connect to Lovable Cloud.`,
    pages: [page],
  };
}

export async function generateRandomIdea(): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return randomIdeas[Math.floor(Math.random() * randomIdeas.length)];
}
