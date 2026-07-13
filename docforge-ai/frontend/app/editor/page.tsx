'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type DocumentState = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type TemplateState = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function getPreviewBlocks(content: string) {
  const lines = content.split(/\n+/).filter(Boolean);

  return lines.map((line, index) => {
    if (line.startsWith('### ')) {
      return <h3 key={`${line}-${index}`} className="mt-4 text-lg font-semibold text-[#1f2937]">{line.replace('### ', '')}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={`${line}-${index}`} className="mt-5 text-xl font-semibold text-[#1f2937]">{line.replace('## ', '')}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={`${line}-${index}`} className="mt-6 text-2xl font-semibold text-[#1f2937]">{line.replace('# ', '')}</h1>;
    }
    if (line.startsWith('> ')) {
      return <blockquote key={`${line}-${index}`} className="mt-3 border-l-2 border-[#1f6f5f] pl-4 italic text-[#6b7280]">{line.replace('> ', '')}</blockquote>;
    }
    if (line.startsWith('- ')) {
      return <li key={`${line}-${index}`} className="ml-5 mt-2 list-disc text-[#6b7280]">{line.replace('- ', '')}</li>;
    }
    return <p key={`${line}-${index}`} className="mt-3 text-sm leading-7 text-[#6b7280]">{line}</p>;
  });
}

export default function EditorPage() {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [templates, setTemplates] = useState<TemplateState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const previewBlocks = useMemo(() => getPreviewBlocks(document?.content ?? ''), [document?.content]);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [documentResponse, templateResponse] = await Promise.all([
        fetch(`${apiBase}/documents/active`),
        fetch(`${apiBase}/templates`),
      ]);

      if (!documentResponse.ok || !templateResponse.ok) {
        throw new Error('The editor could not reach the live document service.');
      }

      const documentData = (await documentResponse.json()) as DocumentState;
      const templatesData = (await templateResponse.json()) as TemplateState[];

      setDocument(documentData);
      setTemplates(templatesData);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the live editor data.');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveDocument(nextDocument: DocumentState) {
    try {
      setIsSaving(true);
      const response = await fetch(`${apiBase}/documents/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextDocument),
      });

      if (!response.ok) {
        throw new Error('The document could not be saved.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The document could not be saved.');
    } finally {
      setIsSaving(false);
    }
  }

  async function createTemplateFromContent() {
    if (!document?.content.trim()) {
      setError('Add content to create a reusable template.');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.title || 'Untitled template', content: document.content }),
      });

      if (!response.ok) {
        throw new Error('The template could not be created.');
      }

      const createdTemplate = (await response.json()) as TemplateState;
      setTemplates((current) => [createdTemplate, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The template could not be created.');
    }
  }

  async function runAssistant(action: 'summary' | 'tone' | 'structure') {
    if (!document?.content.trim()) {
      setError('Add content before running an assistant action.');
      return;
    }

    try {
      setAssistantBusy(true);
      const response = await fetch(`${apiBase}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content: document.content }),
      });

      if (!response.ok) {
        throw new Error('The assistant request could not be completed.');
      }

      const payload = (await response.json()) as { content: string };
      setDocument((current) => (current ? { ...current, content: payload.content, updatedAt: new Date().toISOString() } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant request failed.');
    } finally {
      setAssistantBusy(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!hasLoaded || !document) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveDocument(document);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [document?.content, document?.title, hasLoaded]);

  function insertFormat(prefix: string, suffix = '') {
    const textarea = textareaRef.current;
    if (!textarea || !document) {
      return;
    }

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
      <main className="min-h-screen bg-[#fafaf8] p-6 text-[#1f2937] sm:p-10">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-[#e7e5e4] bg-white p-8 text-sm text-[#6b7280] shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
          Loading live document data...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] p-6 text-[#1f2937] sm:p-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[32px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Live editor</p>
              <h1 className="mt-2 text-3xl font-semibold">Document Studio</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#1f6f5f]/10 px-3 py-1 text-sm font-medium text-[#1f6f5f]">
                {isSaving ? 'Saving…' : 'Live sync'}
              </span>
              <button
                onClick={createTemplateFromContent}
                className="rounded-full border border-[#e7e5e4] bg-[#fcfbf8] px-4 py-2 text-sm font-medium text-[#1f2937]"
              >
                Save as template
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-[#e7e5e4] bg-[#fcfbf8] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={document?.title ?? ''}
                onChange={(event) => setDocument((current) => (current ? { ...current, title: event.target.value } : current))}
                className="w-full rounded-2xl border border-[#e7e5e4] bg-white px-4 py-3 text-sm font-medium text-[#1f2937] outline-none ring-0"
                placeholder="Document title"
              />
              <select className="rounded-2xl border border-[#e7e5e4] bg-white px-4 py-3 text-sm text-[#6b7280] outline-none">
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => insertFormat('# ')} className="rounded-full border border-[#e7e5e4] bg-white px-3 py-2 text-sm text-[#1f2937]">
                Heading
              </button>
              <button onClick={() => insertFormat('> ')} className="rounded-full border border-[#e7e5e4] bg-white px-3 py-2 text-sm text-[#1f2937]">
                Quote
              </button>
              <button onClick={() => insertFormat('- ')} className="rounded-full border border-[#e7e5e4] bg-white px-3 py-2 text-sm text-[#1f2937]">
                Bullet
              </button>
              <button onClick={() => insertFormat('```\n', '\n```')} className="rounded-full border border-[#e7e5e4] bg-white px-3 py-2 text-sm text-[#1f2937]">
                Code
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={document?.content ?? ''}
              onChange={(event) => setDocument((current) => (current ? { ...current, content: event.target.value } : current))}
              className="mt-4 min-h-[320px] w-full rounded-[24px] border border-[#e7e5e4] bg-white px-4 py-4 text-sm leading-7 text-[#1f2937] outline-none"
              placeholder="Start typing your document here..."
            />
          </div>

          {error ? <p className="mt-4 text-sm text-[#c62828]">{error}</p> : null}
        </section>

        <aside className="space-y-6 rounded-[32px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Live preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f2937]">Refined output</h2>
            <div className="mt-4 rounded-[24px] border border-[#e7e5e4] bg-[#fcfbf8] p-4">
              {document?.content ? previewBlocks : <p className="text-sm text-[#6b7280]">Your generated preview will appear here as you type.</p>}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">AI assistant</p>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => void runAssistant('summary')}
                className="w-full rounded-2xl border border-[#e7e5e4] bg-[#fcfbf8] px-4 py-3 text-left text-sm font-medium text-[#1f2937]"
              >
                {assistantBusy ? 'Working…' : 'Generate summary'}
              </button>
              <button
                onClick={() => void runAssistant('tone')}
                className="w-full rounded-2xl border border-[#e7e5e4] bg-[#fcfbf8] px-4 py-3 text-left text-sm font-medium text-[#1f2937]"
              >
                Refine tone
              </button>
              <button
                onClick={() => void runAssistant('structure')}
                className="w-full rounded-2xl border border-[#e7e5e4] bg-[#fcfbf8] px-4 py-3 text-left text-sm font-medium text-[#1f2937]"
              >
                Build structure
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Templates</p>
            <div className="mt-4 space-y-3">
              {templates.length === 0 ? (
                <p className="text-sm text-[#6b7280]">Templates will appear here after you save one from the editor.</p>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setDocument((current) => (current ? { ...current, content: template.content, title: template.name } : current))}
                    className="w-full rounded-2xl border border-[#e7e5e4] bg-[#fcfbf8] px-4 py-3 text-left"
                  >
                    <p className="text-sm font-medium text-[#1f2937]">{template.name}</p>
                    <p className="mt-1 text-xs text-[#6b7280]">Loaded from the live template service</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
