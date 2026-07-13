'use client';

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
  if (!value) {
    return 'Recently updated';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DashboardPage() {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [templates, setTemplates] = useState<TemplateState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [documentResponse, templateResponse] = await Promise.all([
          fetch(`${apiBase}/documents/active`),
          fetch(`${apiBase}/templates`),
        ]);

        if (!documentResponse.ok || !templateResponse.ok) {
          throw new Error('The workspace could not reach the live document service.');
        }

        const documentData = (await documentResponse.json()) as DocumentState;
        const templatesData = (await templateResponse.json()) as TemplateState[];

        setDocument(documentData);
        setTemplates(templatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load workspace data.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafaf8] p-6 text-[#1f2937] sm:p-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[28px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold">Workspace dashboard</h1>
          <p className="mt-3 max-w-2xl text-[#6b7280]">
            A live view of the active document, available templates, and the latest editorial context from the backend.
          </p>
        </header>

        {error ? <p className="text-sm text-[#c62828]">{error}</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#e7e5e4] bg-white p-5 shadow-[0_12px_28px_rgba(31,41,55,0.03)]">
            <p className="text-sm text-[#6b7280]">Active document</p>
            <p className="mt-2 text-2xl font-semibold text-[#1f2937]">{isLoading ? 'Loading…' : document?.title ?? 'Untitled document'}</p>
            <p className="mt-2 text-sm text-[#1f6f5f]">{document ? formatDate(document.updatedAt) : 'Waiting for data'}</p>
          </div>
          <div className="rounded-[24px] border border-[#e7e5e4] bg-white p-5 shadow-[0_12px_28px_rgba(31,41,55,0.03)]">
            <p className="text-sm text-[#6b7280]">Templates</p>
            <p className="mt-2 text-2xl font-semibold text-[#1f2937]">{templates.length}</p>
            <p className="mt-2 text-sm text-[#1f6f5f]">Ready to reuse in the editor</p>
          </div>
          <div className="rounded-[24px] border border-[#e7e5e4] bg-white p-5 shadow-[0_12px_28px_rgba(31,41,55,0.03)]">
            <p className="text-sm text-[#6b7280]">Editorial flow</p>
            <p className="mt-2 text-2xl font-semibold text-[#1f2937]">Live sync</p>
            <p className="mt-2 text-sm text-[#1f6f5f]">Autosave and assistant actions are active</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1f2937]">Current document</h2>
              <a href="/editor" className="text-sm font-medium text-[#1f6f5f] hover:text-[#175a4d]">
                Open editor
              </a>
            </div>
            <div className="mt-5 rounded-[24px] border border-[#e7e5e4] bg-[#fcfbf8] p-4">
              {document ? (
                <>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Active draft</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1f2937]">{document.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#6b7280]">
                    {document.content.trim() ? document.content.trim().slice(0, 220) : 'Start writing in the editor to populate this workspace view.'}
                  </p>
                  <p className="mt-4 text-sm text-[#1f6f5f]">Last updated {formatDate(document.updatedAt)}</p>
                </>
              ) : (
                <p className="text-sm text-[#6b7280]">No live document data is available yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7e5e4] bg-white p-6 shadow-[0_16px_45px_rgba(31,41,55,0.04)]">
            <h2 className="text-xl font-semibold text-[#1f2937]">Latest templates</h2>
            <div className="mt-5 space-y-3">
              {templates.length === 0 ? (
                <p className="text-sm text-[#6b7280]">Templates will appear here after you save one from the editor.</p>
              ) : (
                templates.slice(0, 3).map((template) => (
                  <div key={template.id} className="rounded-2xl border border-[#e7e5e4] bg-[#fcfbf8] p-4">
                    <p className="font-medium text-[#1f2937]">{template.name}</p>
                    <p className="mt-1 text-sm text-[#6b7280]">{template.content.trim().slice(0, 90) || 'Reusable starter content'}</p>
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
