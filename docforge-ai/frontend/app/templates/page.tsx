'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

function formatDate(value: string) {
  if (!value) return 'Recently created';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function TemplatesPage() {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [templates, setTemplates] = useState<TemplateState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [documentResponse, templateResponse] = await Promise.all([
        fetch(`${apiBase}/documents/active`),
        fetch(`${apiBase}/templates`),
      ]);

      if (!documentResponse.ok || !templateResponse.ok) {
        throw new Error('The template workspace could not reach the live service.');
      }

      const documentData = (await documentResponse.json()) as DocumentState;
      const templatesData = (await templateResponse.json()) as TemplateState[];

      setDocument(documentData);
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load templates.');
    } finally {
      setIsLoading(false);
    }
  }

  async function applyTemplate(template: TemplateState) {
    try {
      setStatus(null);
      const response = await fetch(`${apiBase}/documents/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: template.name, content: template.content }),
      });

      if (!response.ok) {
        throw new Error('The template could not be loaded into the editor.');
      }

      const nextDocument = (await response.json()) as DocumentState;
      setDocument(nextDocument);
      setStatus(`${template.name} is now ready in the editor.`);
      router.push('/editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The template could not be applied.');
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf8] p-6 text-[#1f2937] sm:p-10 font-sans antialiased">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[28px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Templates</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1f2937]">Templates & integrations</h1>
          <p className="mt-3 max-w-2xl text-[#6b7280]">
            Browse a live collection of reusable document structures and load them directly into the editor.
          </p>
        </header>

        {error ? <p className="mt-4 text-sm text-[#c62828]">{error}</p> : null}
        {status ? <p className="mt-4 text-sm text-[#1f6f5f]">{status}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[28px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
            <h2 className="text-xl font-semibold text-[#1f2937]">Current workspace</h2>
            <div className="mt-5 rounded-[24px] border border-[#e7e5e4] bg-[#fafaf8] p-4">
              {isLoading ? (
                <p className="text-sm text-[#6b7280]">Loading workspace status…</p>
              ) : document ? (
                <>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Active document</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1f2937]">{document.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6b7280]">
                    {document.content.trim() ? document.content.trim().slice(0, 160) : 'Add text in the editor to build a stronger draft.'}
                  </p>
                  <p className="mt-4 text-sm text-[#1f6f5f]">Last updated {formatDate(document.updatedAt)}</p>
                </>
              ) : (
                <p className="text-sm text-[#6b7280]">No document is currently available from the backend.</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
            <h2 className="text-xl font-semibold text-[#1f2937]">Template library</h2>
            <div className="mt-5 grid gap-4">
              {templates.length === 0 ? (
                <p className="text-sm text-[#6b7280]">No templates have been created yet.</p>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="rounded-[24px] border border-[#e7e5e4] bg-[#fafaf8] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-[#1f2937]">{template.name}</p>
                        <p className="mt-2 text-sm leading-6 text-[#6b7280]">{template.content.trim().slice(0, 140) || 'Reusable starter content'}</p>
                      </div>
                      <span className="rounded-full bg-[#1f6f5f]/10 px-3 py-1 text-sm font-medium text-[#1f6f5f]">{formatDate(template.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => void applyTemplate(template)}
                      className="mt-4 rounded-xl border border-[#e7e5e4] bg-white hover:bg-[#f7f5f0] px-4 py-2 text-sm font-medium text-[#1f2937] transition-colors"
                    >
                      Load into editor
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
