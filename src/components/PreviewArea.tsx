import { useEffect, useRef, useCallback } from 'react';
import { Monitor, RefreshCw, ExternalLink, Maximize2 } from 'lucide-react';
import { Page } from '@/types';
import { cn } from '@/lib/utils';

interface PreviewAreaProps {
  pages: Page[];
  activePageId: string | null;
  onPageChange: (pageId: string) => void;
}

function processHtml(html: string): string {
  // If it's a fragment, wrap it in a full HTML shell
  if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-gray-900 text-white">
  ${html}
</body>
</html>`;
  }

  // Fix image sources - replace non-URL src with Pollinations
  html = html.replace(
    /src=["'](?!https?:\/\/|data:)([^"']+)["']/gi,
    (match, alt) => {
      const encodedAlt = encodeURIComponent(alt.replace(/[^\w\s]/g, ' ').trim() || 'abstract image');
      return `src="https://image.pollinations.ai/prompt/${encodedAlt}"`;
    }
  );

  // Inject navigation bridge script before closing body tag
  const navBridgeScript = `
<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('#') || href.startsWith('/') || !href.includes('://'))) {
        e.preventDefault();
        window.parent.postMessage({ type: 'navigate', href: href }, '*');
      }
    }
  });
</script>`;

  if (html.includes('</body>')) {
    html = html.replace('</body>', `${navBridgeScript}</body>`);
  } else {
    html += navBridgeScript;
  }

  return html;
}

export function PreviewArea({ pages, activePageId, onPageChange }: PreviewAreaProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activePage = pages.find((p) => p.id === activePageId);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === 'navigate') {
      const href = event.data.href;
      // Find page by href (simplified matching)
      const targetPage = pages.find(
        (p) => p.id === href.replace('#', '').replace('/', '') || 
               p.title.toLowerCase() === href.replace('#', '').replace('/', '').toLowerCase()
      );
      if (targetPage) {
        onPageChange(targetPage.id);
      }
    }
  }, [pages, onPageChange]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    if (iframeRef.current && activePage) {
      const processedHtml = processHtml(activePage.html);
      iframeRef.current.srcdoc = processedHtml;
    }
  }, [activePage]);

  const handleRefresh = () => {
    if (iframeRef.current && activePage) {
      const processedHtml = processHtml(activePage.html);
      iframeRef.current.srcdoc = processedHtml;
    }
  };

  const handleOpenExternal = () => {
    if (activePage) {
      const processedHtml = processHtml(activePage.html);
      const blob = new Blob([processedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-1">
        <div className="flex items-center gap-2">
          {/* Page Tabs */}
          {pages.length > 0 ? (
            <div className="flex items-center gap-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onPageChange(page.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    activePageId === page.id
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                  )}
                >
                  {page.title}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs font-mono text-muted-foreground">No pages</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={!activePage}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-2 
                       rounded-md transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenExternal}
            disabled={!activePage}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-2 
                       rounded-md transition-colors disabled:opacity-50"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            disabled={!activePage}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-2 
                       rounded-md transition-colors disabled:opacity-50"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 relative">
        {activePage ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        ) : (
          <div className="preview-empty">
            <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-6">
              <Monitor className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Ready to visualize</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] text-center">
              Select a template from the chat or describe your idea to generate a live preview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
