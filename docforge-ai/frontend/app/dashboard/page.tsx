'use client';

import { useEffect, useState, useMemo } from 'react';

type DocumentRecord = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  folderId: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  tags: string[];
  updatedAt: string;
};

type FolderRecord = {
  id: string;
  name: string;
  createdAt: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function formatDate(value: string) {
  if (!value) return 'Recently updated';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocTags, setNewDocTags] = useState('');

  // Fetch all documents and folders
  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [docsResponse, foldersResponse] = await Promise.all([
        fetch(`${apiBase}/documents`),
        fetch(`${apiBase}/folders`),
      ]);

      if (!docsResponse.ok || !foldersResponse.ok) {
        throw new Error('Unable to fetch workspace data from the backend server.');
      }

      const docsData = (await docsResponse.json()) as DocumentRecord[];
      const foldersData = (await foldersResponse.json()) as FolderRecord[];

      setDocuments(docsData);
      setFolders(foldersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred loading the workspace.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search match
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Folder match
      const matchesFolder =
        selectedFolderId === null || doc.folderId === selectedFolderId;

      // Favorite match
      const matchesFavorite = !filterFavoriteOnly || doc.isFavorite;

      return matchesSearch && matchesFolder && matchesFavorite;
    });
  }, [documents, searchQuery, selectedFolderId, filterFavoriteOnly]);

  const pinnedDocuments = useMemo(() => {
    return documents.filter((doc) => doc.isPinned);
  }, [documents]);

  // Create Folder
  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch(`${apiBase}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });

      if (!res.ok) throw new Error('Failed to create folder.');
      const folder = (await res.json()) as FolderRecord;
      setFolders((current) => [...current, folder]);
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating folder.');
    }
  }

  // Create Document
  async function handleCreateDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    try {
      const tagsArray = newDocTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const res = await fetch(`${apiBase}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle.trim(),
          description: newDocDesc.trim() || null,
          content: '',
          folderId: selectedFolderId,
          tags: tagsArray,
        }),
      });

      if (!res.ok) throw new Error('Failed to create document.');
      const doc = (await res.json()) as DocumentRecord;
      setDocuments((current) => [doc, ...current]);
      setNewDocTitle('');
      setNewDocDesc('');
      setNewDocTags('');
      setShowDocModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating document.');
    }
  }

  // Toggle Pinned
  async function togglePinned(doc: DocumentRecord) {
    try {
      const res = await fetch(`${apiBase}/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !doc.isPinned }),
      });

      if (!res.ok) throw new Error('Failed to toggle pin state.');
      const updated = (await res.json()) as DocumentRecord;
      setDocuments((current) => current.map((d) => (d.id === doc.id ? updated : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error modifying pin state.');
    }
  }

  // Toggle Favorite
  async function toggleFavorite(doc: DocumentRecord) {
    try {
      const res = await fetch(`${apiBase}/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !doc.isFavorite }),
      });

      if (!res.ok) throw new Error('Failed to toggle favorite state.');
      const updated = (await res.json()) as DocumentRecord;
      setDocuments((current) => current.map((d) => (d.id === doc.id ? updated : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error modifying favorite state.');
    }
  }

  // Delete Document
  async function handleDeleteDocument(docId: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`${apiBase}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete document.');
      setDocuments((current) => current.filter((d) => d.id !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting document.');
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1f2937] font-sans antialiased">
      <div className="mx-auto flex max-w-[1440px] px-6 py-8">
        
        {/* SIDEBAR */}
        <aside className="w-64 shrink-0 pr-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1f6f5f] to-[#d4a373] flex items-center justify-center text-white font-bold text-lg">
              DF
            </div>
            <div>
              <span className="font-semibold text-base font-display text-[#1f2937]">DocForge AI</span>
              <p className="text-xs text-[#6b7280]">Workspace Hub</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setSelectedFolderId(null);
                setFilterFavoriteOnly(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                selectedFolderId === null && !filterFavoriteOnly
                  ? 'bg-[#1f6f5f]/10 text-[#1f6f5f]'
                  : 'text-[#6b7280] hover:bg-[#f7f5f0]'
              }`}
            >
              <span>📁 All Documents</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#e7e5e4]">
                {documents.length}
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedFolderId(null);
                setFilterFavoriteOnly(true);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                filterFavoriteOnly
                  ? 'bg-[#1f6f5f]/10 text-[#1f6f5f]'
                  : 'text-[#6b7280] hover:bg-[#f7f5f0]'
              }`}
            >
              <span>⭐ Favorites</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#e7e5e4]">
                {documents.filter((d) => d.isFavorite).length}
              </span>
            </button>
          </nav>

          <hr className="border-[#e7e5e4]" />

          {/* FOLDERS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Folders</span>
              <button
                onClick={() => setShowFolderModal(true)}
                className="text-xs font-bold text-[#1f6f5f] hover:underline"
              >
                + New
              </button>
            </div>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolderId(folder.id);
                    setFilterFavoriteOnly(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors flex items-center justify-between ${
                    selectedFolderId === folder.id
                      ? 'bg-[#1f6f5f]/10 text-[#1f6f5f] font-medium'
                      : 'text-[#6b7280] hover:bg-[#f7f5f0]'
                  }`}
                >
                  <span>🗂️ {folder.name}</span>
                  <span className="text-xs text-[#6b7280]">
                    {documents.filter((d) => d.folderId === folder.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN BODY */}
        <section className="flex-1 pl-4 space-y-8">
          
          {/* HEADER & SEARCH */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by title, tags..."
                className="w-full bg-white border border-[#e7e5e4] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f6f5f]/20"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDocModal(true)}
                className="px-5 py-3 rounded-2xl bg-[#1f6f5f] hover:bg-[#175a4d] text-white font-medium text-sm transition-colors"
              >
                + Create Document
              </button>
            </div>
          </header>

          {error && (
            <div className="p-4 rounded-2xl bg-[#ffdad6] text-[#93000a] text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {isLoading ? (
            <div className="p-8 rounded-[24px] bg-white border border-[#e7e5e4] text-sm text-[#6b7280] text-center shadow-sm">
              Syncing workspace metadata...
            </div>
          ) : (
            <>
              {/* PINNED GRID */}
              {pinnedDocuments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Pinned</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pinnedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-2xl border border-[#e7e5e4] bg-white p-5 shadow-sm space-y-4 hover:border-[#1f6f5f]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => togglePinned(doc)}
                            className="text-[#d4a373] text-lg hover:scale-110 transition-transform"
                          >
                            📌
                          </button>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleFavorite(doc)} className="text-sm hover:scale-110 transition-transform">
                              {doc.isFavorite ? '⭐' : '☆'}
                            </button>
                            <button onClick={() => handleDeleteDocument(doc.id)} className="text-sm hover:text-red-500">
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div>
                          <a href="/editor" className="block group">
                            <h4 className="font-semibold text-base text-[#1f2937] group-hover:text-[#1f6f5f] transition-colors line-clamp-1">
                              {doc.title}
                            </h4>
                            <p className="text-xs text-[#6b7280] mt-1 line-clamp-2 min-h-[2rem]">
                              {doc.description || 'No description provided.'}
                            </p>
                          </a>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#6b7280] pt-2 border-t border-[#e7e5e4]/20">
                          <span>{formatDate(doc.updatedAt)}</span>
                          <span className="bg-[#1f6f5f]/10 text-[#1f6f5f] px-2 py-0.5 rounded text-[10px] font-semibold">
                            PDF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LIST VIEWS */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                  {selectedFolderId
                    ? `Documents in ${folders.find((f) => f.id === selectedFolderId)?.name || 'Folder'}`
                    : 'All Documents'}
                </h3>
                <div className="rounded-[24px] border border-[#e7e5e4] bg-white shadow-sm overflow-hidden">
                  {filteredDocuments.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#6b7280]">
                      No documents found in this workspace filter.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e7e5e4]/30">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 hover:bg-[#fafaf8] transition-colors"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-3">
                              <a href="/editor" className="hover:text-[#1f6f5f] text-[#1f2937] font-semibold text-sm truncate">
                                {doc.title}
                              </a>
                              {doc.isPinned && <span className="text-xs">📌</span>}
                              {doc.isFavorite && <span className="text-xs">⭐</span>}
                            </div>
                            <p className="text-xs text-[#6b7280] truncate mt-1">
                              {doc.description || 'No description'}
                            </p>
                            {doc.tags.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-2">
                                {doc.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] bg-[#f7f5f0] text-[#6b7280] px-1.5 py-0.5 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs text-[#6b7280]">{formatDate(doc.updatedAt)}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePinned(doc)}
                                className="text-sm px-2 py-1 rounded hover:bg-[#1f6f5f]/10 transition-colors"
                                title="Pin document"
                              >
                                {doc.isPinned ? '📌' : '📍'}
                              </button>
                              <button
                                onClick={() => toggleFavorite(doc)}
                                className="text-sm px-2 py-1 rounded hover:bg-[#1f6f5f]/10 transition-colors"
                                title="Favorite document"
                              >
                                {doc.isFavorite ? '⭐' : '☆'}
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-sm px-2 py-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                                title="Delete document"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* CREATE FOLDER MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-[#1f2937]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#e7e5e4] shadow-lg space-y-4"
          >
            <h3 className="font-semibold text-lg font-display text-[#1f2937]">Create Folder</h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#6b7280] mb-2">Folder Name</label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Invoices, Reports"
                className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f6f5f]/20"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#6b7280] hover:bg-[#f7f5f0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1f6f5f] text-white text-sm font-medium hover:bg-[#175a4d] transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE DOCUMENT MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 bg-[#1f2937]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateDocument}
            className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#e7e5e4] shadow-lg space-y-4"
          >
            <h3 className="font-semibold text-lg font-display text-[#1f2937]">Create Document</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6b7280] mb-1.5">Document Title</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Q3 Business Plan"
                  className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f6f5f]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6b7280] mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={newDocDesc}
                  onChange={(e) => setNewDocDesc(e.target.value)}
                  placeholder="e.g. Outline of marketing goals"
                  className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f6f5f]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[#6b7280] mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newDocTags}
                  onChange={(e) => setNewDocTags(e.target.value)}
                  placeholder="e.g. marketing, proposal, draft"
                  className="w-full bg-[#fafaf8] border border-[#e7e5e4] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f6f5f]/20"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#6b7280] hover:bg-[#f7f5f0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1f6f5f] text-white text-sm font-medium hover:bg-[#175a4d] transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
