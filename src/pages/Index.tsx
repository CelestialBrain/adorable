import { useState, useCallback } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewArea } from '@/components/PreviewArea';
import { Message, Page } from '@/types';
import { generateVibe, generateRandomIdea } from '@/services/mockGeminiService';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Build history for context
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await generateVibe(content, history);

      // Add assistant message
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.response,
        thought: result.thought,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Smart merge pages
      setPages((prevPages) => {
        const newPages = [...prevPages];
        for (const page of result.pages) {
          const existingIndex = newPages.findIndex((p) => p.id === page.id);
          if (existingIndex >= 0) {
            newPages[existingIndex] = page;
          } else {
            newPages.push(page);
          }
        }
        return newPages;
      });

      // Set active page to the first new page if none selected
      if (result.pages.length > 0) {
        setActivePageId(result.pages[0].id);
      }
    } catch (error) {
      console.error('Error generating:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, there was an error generating your design. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  }, [messages]);

  const handleRandomIdea = useCallback(async () => {
    return await generateRandomIdea();
  }, []);

  const handlePageChange = useCallback((pageId: string) => {
    setActivePageId(pageId);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Chat Panel - 35% */}
      <div className="w-[35%] min-w-[320px] max-w-[480px] flex-shrink-0">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onRandomIdea={handleRandomIdea}
          isGenerating={isGenerating}
        />
      </div>

      {/* Preview Area - 65% */}
      <div className="flex-1">
        <PreviewArea
          pages={pages}
          activePageId={activePageId}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Index;
