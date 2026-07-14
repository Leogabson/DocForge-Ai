'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type DocumentState = {
  id: string;
  title: string;
  content: string;
  styleConfig: string;
  updatedAt: string;
};

type TemplateState = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Helper to convert Markdown into styled blocks for live preview
function getPreviewBlocks(content: string) {
  if (!content.trim()) {
    return <p className="text-sm text-[#6b7280] italic">Your styled document output will appear here as you type...</p>;
  }

  const lines = content.split('\n');
  let inList = false;
  const listItems: string[] = [];
  const blocks: React.ReactNode[] = [];

  function flushList(key: string) {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={key} className="list-disc pl-5 mt-2 mb-4 space-y-1 text-[#6b7280] text-sm leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      listItems.length = 0;
      inList = false;
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Handle bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      return;
    } else {
      flushList(`list-${index}`);
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={index} className="text-3xl font-bold font-display text-[#1f2937] mt-6 mb-3 first:mt-0">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={index} className="text-2xl font-semibold font-display text-[#1f2937] mt-5 mb-2.5">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={index} className="text-xl font-semibold font-display text-[#1f2937] mt-4 mb-2">
          {line.slice(4)}
        </h3>
      );
    } 
    // Blockquote
    else if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={index} className="border-l-4 border-[#1f6f5f] bg-[#1f6f5f]/5 pl-4 py-2 my-4 italic text-[#6b7280] rounded-r-lg text-sm">
          {line.slice(2)}
        </blockquote>
      );
    } 
    // Code block
    else if (line.startsWith('```')) {
      blocks.push(
        <pre key={index} className="bg-[#f7f5f0] text-[#1f2937] font-mono text-xs p-3 rounded-xl my-3 overflow-x-auto border border-[#e7e5e4]/40">
          <code>{line}</code>
        </pre>
      );
    } 
    // Empty spacing line
    else if (!trimmed) {
      blocks.push(<div key={index} className="h-2" />);
    } 
    // Regular paragraph
    else {
      let renderedText = trimmed;
      // Bold **text**
      renderedText = renderedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic *text*
      renderedText = renderedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

      blocks.push(
        <p
          key={index}
          className="text-sm leading-relaxed text-[#6b7280] mb-3"
          dangerouslySetInnerHTML={{ __html: renderedText }}
        />
      );
    }
  });

  flushList('list-end');
  return <div className="space-y-1">{blocks}</div>;
}

export default function EditorPage() {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [templates, setTemplates] = useState<TemplateState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Document Styling States
  const [fontFamily, setFontFamily] = useState('Inter');
  const [theme, setTheme] = useState('Modern Clean');
  const [marginSize, setMarginSize] = useState(24);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  
  // Selection/Floating toolbar states
  const [selectedText, setSelectedText] = useState('');
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);

  // Local recovery states
  const [recoveredDraft, setRecoveredDraft] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => {
    const text = document?.content ?? '';
    const characters = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute
    return { characters, words, readingTime };
  }, [document?.content]);

  const previewBlocks = useMemo(() => getPreviewBlocks(document?.content ?? ''), [document?.content]);

  // Load editor details
  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [documentResponse, templateResponse] = await Promise.all([
        fetch(`${apiBase}/documents/active`),
        fetch(`${apiBase}/templates`),
      ]);

      if (!documentResponse.ok || !templateResponse.ok) {
        throw new Error('Unable to contact backend active document services.');
      }

      const documentData = (await documentResponse.json()) as DocumentState;
      const templatesData = (await templateResponse.json()) as TemplateState[];

      // Parse style configuration
      try {
        if (documentData.styleConfig) {
          const config = JSON.parse(documentData.styleConfig);
          if (config.fontFamily) setFontFamily(config.fontFamily);
          if (config.theme) setTheme(config.theme);
          if (config.marginSize) setMarginSize(Number(config.marginSize));
          if (config.orientation) setOrientation(config.orientation);
          if (config.headerText) setHeaderText(config.headerText);
          if (config.footerText) setFooterText(config.footerText);
        }
      } catch (e) {
        console.error('Error parsing styleConfig:', e);
      }

      // Check local storage for newer unsaved draft recovery
      const localDraft = localStorage.getItem(`docforge_draft_${documentData.id}`);
      if (localDraft && localDraft !== documentData.content) {
        setRecoveredDraft(localDraft);
      }

      setDocument(documentData);
      setTemplates(templatesData);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error starting workspace session.');
    } finally {
      setIsLoading(false);
    }
  }

  // Restore local draft
  function handleRestoreDraft() {
    if (document && recoveredDraft) {
      setDocument({ ...document, content: recoveredDraft });
      setRecoveredDraft(null);
    }
  }

  // Save to DB (debounced)
  async function saveDocument(nextDocument: DocumentState) {
    try {
      setSaveStatus('saving');
      setIsSaving(true);

      // Save to localStorage for instant local backup
      localStorage.setItem(`docforge_draft_${nextDocument.id}`, nextDocument.content);

      const response = await fetch(`${apiBase}/documents/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextDocument),
      });

      if (!response.ok) {
        throw new Error('Sync failed.');
      }

      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('offline');
    } finally {
      setIsSaving(false);
    }
  }

  async function createTemplateFromContent() {
    if (!document?.content.trim()) {
      setError('Add content to save as template.');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.title || 'Untitled template', content: document.content }),
      });

      if (!response.ok) throw new Error('Template create failed.');
      const createdTemplate = (await response.json()) as TemplateState;
      setTemplates((current) => [createdTemplate, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template.');
    }
  }

  async function runAssistant(action: 'summary' | 'tone' | 'structure') {
    if (!document?.content.trim()) return;

    try {
      setAssistantBusy(true);
      const response = await fetch(`${apiBase}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: document.content }),
      });

      if (!response.ok) throw new Error('AI request failed.');
      const payload = (await response.json()) as { content: string };
      setDocument((current) => (current ? { ...current, content: payload.content, updatedAt: new Date().toISOString() } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI assistant failed.');
    } finally {
      setAssistantBusy(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  // Debounced auto-save triggers on content, title, or styling updates
  useEffect(() => {
    if (!hasLoaded || !document) return;

    const styleConfig = JSON.stringify({
      fontFamily,
      theme,
      marginSize,
      orientation,
      headerText,
      footerText,
    });

    const timer = window.setTimeout(() => {
      void saveDocument({ ...document, styleConfig });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [document?.content, document?.title, fontFamily, theme, marginSize, orientation, headerText, footerText, hasLoaded]);

  // Floating toolbar toggling based on text selection
  function handleTextareaSelect(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const target = e.currentTarget;
    const selection = target.value.slice(target.selectionStart, target.selectionEnd);
    if (selection.trim().length > 0) {
      setSelectedText(selection);
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  }

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+Q, Ctrl+K)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier) {
      if (e.key === 'b') {
        e.preventDefault();
        insertFormat('**', '**');
      } else if (e.key === 'i') {
        e.preventDefault();
        insertFormat('*', '*');
      } else if (e.key === 'q') {
        e.preventDefault();
        insertFormat('> ');
      } else if (e.key === 'k') {
        e.preventDefault();
        insertFormat('[', '](url)');
      }
    }
  }

  function insertFormat(prefix: string, suffix = '') {
    const textarea = textareaRef.current;
    if (!textarea || !document) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = document.content;
    const selected = current.slice(start, end);
    const nextValue = `${current.slice(0, start)}${prefix}${selected}${suffix}${current.slice(end)}`;

    setDocument({ ...document, content: nextValue });

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPosition = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#fafaf8] flex items-center justify-center p-6">
        <div className="text-sm text-[#6b7280] font-semibold tracking-wide animate-pulse">
          Opening editor studio...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1f2937] font-sans antialiased px-6 py-8">
      <div className="mx-auto max-w-[1440px] flex flex-col gap-6">
        
        {/* HEADER BAR */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-[#e7e5e4] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-[#1f6f5f] hover:underline text-sm font-semibold flex items-center gap-1.5">
              ← Dashboard
            </a>
            <span className="text-[#e7e5e4]">|</span>
            <input
              value={document?.title ?? ''}
              onChange={(e) => setDocument((current) => (current ? { ...current, title: e.target.value } : current))}
              className="font-bold text-lg text-[#1f2937] outline-none border-b border-transparent hover:border-[#e7e5e4]/60 focus:border-[#1f6f5f] bg-transparent transition-colors px-1"
              placeholder="Document title..."
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Auto-Save Indicators */}
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
              {saveStatus === 'saving' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                  <span className="text-yellow-600">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#1f6f5f]" />
                  <span className="text-[#1f6f5f]">Synced to DB</span>
                </>
              )}
              {saveStatus === 'offline' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-500">Offline (local draft saved)</span>
                </>
              )}
            </span>

            <button
              onClick={createTemplateFromContent}
              className="px-4 py-2 border border-[#e7e5e4] bg-white hover:bg-[#f7f5f0] text-sm text-[#6b7280] font-medium rounded-xl transition-colors"
            >
              Save as template
            </button>
          </div>
        </header>

        {/* DRAFT RECOVERY NOTIFICATION */}
        {recoveredDraft && (
          <div className="flex items-center justify-between p-4 bg-[#1f6f5f]/10 border border-[#1f6f5f]/20 rounded-2xl text-sm">
            <span className="text-[#1f2937] font-medium">
              💡 We found a newer unsaved draft of this document stored locally in your browser.
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRecoveredDraft(null)}
                className="text-xs font-bold text-[#6b7280] hover:underline"
              >
                Discard
              </button>
              <button
                onClick={handleRestoreDraft}
                className="px-4 py-1.5 bg-[#1f6f5f] hover:bg-[#175a4d] text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Restore Draft
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-[#ffdad6] text-[#93000a] text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          
          {/* EDITOR WRAPPER */}
          <section className="bg-white border border-[#e7e5e4] p-6 rounded-[32px] shadow-sm relative flex flex-col min-h-[550px]">
            <div className="flex items-center justify-between border-b border-[#e7e5e4]/20 pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Editor Panel</span>
              
              {/* STATS */}
              <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                <span><strong>{stats.words}</strong> words</span>
                <span><strong>{stats.characters}</strong> chars</span>
                <span>⏱️ <strong>{stats.readingTime}</strong> min read</span>
              </div>
            </div>

            {/* FLOATING GLASSMORPHIC TOOLBAR */}
            {showFloatingToolbar && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-[#e7e5e4] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-10 animate-fade-in transition-all">
                <button
                  onClick={() => insertFormat('**', '**')}
                  className="p-1.5 hover:bg-[#1f6f5f]/10 text-xs font-bold rounded"
                  title="Bold (Ctrl+B)"
                >
                  B
                </button>
                <button
                  onClick={() => insertFormat('*', '*')}
                  className="p-1.5 hover:bg-[#1f6f5f]/10 text-xs italic rounded"
                  title="Italic (Ctrl+I)"
                >
                  I
                </button>
                <button
                  onClick={() => insertFormat('> ')}
                  className="p-1.5 hover:bg-[#1f6f5f]/10 text-xs font-mono rounded"
                  title="Quote (Ctrl+Q)"
                >
                  ”
                </button>
                <button
                  onClick={() => insertFormat('- ')}
                  className="p-1.5 hover:bg-[#1f6f5f]/10 text-xs rounded"
                  title="Bullet List"
                >
                  •
                </button>
                <button
                  onClick={() => insertFormat('```\n', '\n```')}
                  className="p-1.5 hover:bg-[#1f6f5f]/10 text-xs font-mono rounded"
                  title="Code block"
                >
                  &lt;/&gt;
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={document?.content ?? ''}
              onChange={(e) => setDocument((current) => (current ? { ...current, content: e.target.value } : current))}
              onSelect={handleTextareaSelect}
              onKeyDown={handleKeyDown}
              className="flex-1 w-full min-h-[420px] text-sm leading-relaxed text-[#1f2937] outline-none resize-none font-mono"
              placeholder="Start drafting your document in Markdown... (Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+Q for blockquotes, Ctrl+K for links)"
            />
          </section>

          {/* ASIDE LAYOUTS: PREVIEW, STYLING & ASSISTANT */}
          <div className="space-y-6">
            
            {/* LIVE PREVIEW */}
            <section className="bg-white border border-[#e7e5e4] p-6 rounded-[32px] shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e7e5e4]/20 pb-4 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Live Preview</span>
                <span className="text-xs text-[#1f6f5f] font-semibold uppercase">Parity Match</span>
              </div>
              <div 
                className="min-h-[250px] max-h-[400px] overflow-y-auto bg-white p-5 rounded-2xl border border-[#e7e5e4]/20 shadow-inner"
                style={{
                  fontFamily: fontFamily === 'Playfair Display' ? 'Georgia, serif' : fontFamily,
                  padding: `${marginSize}px`,
                  width: '100%',
                }}
              >
                {/* Header slot */}
                {headerText && (
                  <div className="border-b border-[#e7e5e4]/40 pb-1.5 mb-4 text-[10px] uppercase tracking-wider text-[#6b7280] flex justify-between font-sans">
                    <span>{headerText}</span>
                    <span>DocForge</span>
                  </div>
                )}

                <div className={theme === 'Academic' ? 'prose prose-sm' : ''}>
                  {previewBlocks}
                </div>

                {/* Footer slot */}
                {footerText && (
                  <div className="border-t border-[#e7e5e4]/40 pt-1.5 mt-6 text-[10px] uppercase tracking-wider text-[#6b7280] flex justify-between font-sans">
                    <span>{footerText}</span>
                    <span>Page 1</span>
                  </div>
                )}
              </div>
            </section>

            {/* DOCUMENT STYLING PANEL */}
            <section className="bg-white border border-[#e7e5e4] p-6 rounded-[32px] shadow-sm space-y-4">
              <div className="border-b border-[#e7e5e4]/20 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Document Styling</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6b7280] mb-1">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-lg p-2 text-xs text-[#1f2937] outline-none"
                  >
                    <option value="Inter">Inter (Sans)</option>
                    <option value="Manrope">Manrope (Modern)</option>
                    <option value="Playfair Display">Playfair (Serif)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6b7280] mb-1">Layout Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-lg p-2 text-xs text-[#1f2937] outline-none"
                  >
                    <option value="Modern Clean">Modern Clean</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Academic">Academic</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-[#6b7280] mb-1">
                  <span>Margins</span>
                  <span>{marginSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="64"
                  value={marginSize}
                  onChange={(e) => setMarginSize(Number(e.target.value))}
                  className="w-full h-1 bg-[#f7f5f0] rounded-lg appearance-none cursor-pointer accent-[#1f6f5f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6b7280] mb-1">Orientation</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-lg p-2 text-xs text-[#1f2937] outline-none"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6b7280] mb-1">Header Label</label>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="e.g. Draft v1"
                    className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-lg p-2 text-xs text-[#1f2937] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6b7280] mb-1">Footer Label</label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g. Confidential"
                  className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-lg p-2 text-xs text-[#1f2937] outline-none"
                />
              </div>
            </section>

            {/* AI ACTIONS */}
            <section className="bg-white border border-[#e7e5e4] p-6 rounded-[32px] shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e7e5e4]/20 pb-4 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">AI Assistant</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => void runAssistant('summary')}
                  disabled={assistantBusy}
                  className="px-4 py-3 rounded-2xl bg-[#1f6f5f]/10 hover:bg-[#1f6f5f]/20 text-[#1f6f5f] font-semibold text-xs text-center transition-colors disabled:opacity-50"
                >
                  {assistantBusy ? 'Working…' : 'Summary'}
                </button>
                <button
                  onClick={() => void runAssistant('tone')}
                  disabled={assistantBusy}
                  className="px-4 py-3 rounded-2xl bg-[#1f6f5f]/10 hover:bg-[#1f6f5f]/20 text-[#1f6f5f] font-semibold text-xs text-center transition-colors disabled:opacity-50"
                >
                  Refine Tone
                </button>
                <button
                  onClick={() => void runAssistant('structure')}
                  disabled={assistantBusy}
                  className="px-4 py-3 rounded-2xl bg-[#1f6f5f]/10 hover:bg-[#1f6f5f]/20 text-[#1f6f5f] font-semibold text-xs text-center transition-colors disabled:opacity-50"
                >
                  Structure
                </button>
              </div>
            </section>

            {/* TEMPLATES QUICK ACCESS */}
            <section className="bg-white border border-[#e7e5e4] p-6 rounded-[32px] shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e7e5e4]/20 pb-4 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Templates</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {templates.length === 0 ? (
                  <p className="text-xs text-[#6b7280]">No templates saved yet.</p>
                ) : (
                  templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setDocument((current) => (current ? { ...current, content: template.content, title: template.name } : current))}
                      className="w-full text-left p-3 border border-[#e7e5e4]/20 hover:bg-[#1f6f5f]/5 rounded-xl transition-colors"
                    >
                      <p className="text-xs font-semibold text-[#1f2937]">{template.name}</p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
