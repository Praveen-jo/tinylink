// app/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CopyButton from './CopyButton';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default function DashboardPage() {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  async function loadLinks() {
    try {
      const res = await fetch('/api/links');
      if (!res.ok) {
        console.error('Failed to load links:', res.status);
        return;
      }
      const data = await res.json();
      setLinks(data);
      setFilteredLinks(data);
    } catch (err) {
      console.error('Error loading links:', err);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadLinks();
    setRefreshing(false);
  }

  useEffect(() => {
    loadLinks();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLinks(links);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = links.filter(
      (link) =>
        link.code.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query)
    );
    setFilteredLinks(filtered);
  }, [searchQuery, links]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    try {
      // basic URL check
      new URL(url);
    } catch {
      setError('Please enter a valid URL (including http/https)');
      return;
    }

    if (code && !CODE_REGEX.test(code)) {
      setError('Code must be 6–8 letters or numbers');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code: code || undefined }),
      });

      if (res.status === 409) {
        const body = await res.json();
        setError(body.error || 'Code already exists');
      } else if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to create link');
      } else {
        const created = await res.json();
        setSuccess(`Created short link ${created.code}`);
        setUrl('');
        setCode('');
        await loadLinks();
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(codeToDelete) {
    setDeleteConfirm(codeToDelete);
  }

  function handleDeleteCancel() {
    setDeleteConfirm(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return;

    setDeleting(true);
    const res = await fetch(`/api/links/${deleteConfirm}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setLinks((prev) => prev.filter((l) => l.code !== deleteConfirm));
      setFilteredLinks((prev) => prev.filter((l) => l.code !== deleteConfirm));
      setDeleteConfirm(null);
      setSuccess('Link deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to delete link');
      setTimeout(() => setError(''), 3000);
    }
    setDeleting(false);
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              TinyLink Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Create and manage short links with click tracking.
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Take-Home Assignment: TinyLink
          </span>
        </header>

        <section className="mb-8">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xl space-y-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-300">
                Destination URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/article"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-300">
                Custom code (optional)
              </label>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <span className="text-xs bg-slate-950 border border-slate-800 px-2 py-1.5 rounded-lg break-all sm:break-normal sm:truncate min-w-0 sm:flex-shrink-0">
                  {baseUrl}/
                </span>
                <input
                  type="text"
                  placeholder="6–8 letters/numbers"
                  className="w-full sm:flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500 min-w-0"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500 break-words">
                Must match: <code className="break-all">[A-Za-z0-9]&#123;6,8&#125;</code>. Leave empty to auto-generate.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-700 px-3 py-2 rounded-xl">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 px-4 py-2.5 text-sm font-medium shadow-lg shadow-sky-500/20"
            >
              {loading ? 'Creating…' : 'Create short link'}
            </button>
          </form>
        </section>

        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">All links</h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 rounded-lg border border-slate-700 hover:border-sky-500 hover:text-sky-400 disabled:opacity-50 transition-colors"
                title="Refresh links"
              >
                <svg
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by code or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 sm:flex-none sm:w-64 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {filteredLinks.length} / {links.length}
              </span>
            </div>
          </div>

          {links.length === 0 ? (
            <p className="text-sm text-slate-500">
              No links yet. Create your first one above.
            </p>
          ) : filteredLinks.length === 0 ? (
            <p className="text-sm text-slate-500">
              No links match your search.
            </p>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {filteredLinks.map((link) => (
                  <div
                    key={link.id}
                    className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Short URL</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${link.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:text-sky-300 font-mono text-sm break-all"
                        >
                          {baseUrl}/{link.code}
                        </a>
                        <CopyButton text={`${baseUrl}/${link.code}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Destination</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-200 hover:text-sky-300 text-sm break-all"
                        >
                          {link.url}
                        </a>
                        <CopyButton text={link.url} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Clicks</p>
                        <p className="text-slate-200">{link.clicks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Created</p>
                        <p className="text-slate-200 text-xs">
                          {new Date(link.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <Link
                        href={`/code/${link.code}`}
                        className="flex-1 text-center px-3 py-2 rounded-lg border border-slate-700 text-xs hover:border-sky-500 hover:text-sky-300"
                      >
                        Stats
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(link.code)}
                        className="flex-1 px-3 py-2 rounded-lg border border-red-700 text-xs text-red-300 hover:bg-red-950/40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto text-sm">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-800">
                      <th className="py-2 pr-4">Short URL</th>
                      <th className="py-2 pr-4">Destination</th>
                      <th className="py-2 pr-4">Clicks</th>
                      <th className="py-2 pr-4">Created</th>
                      <th className="py-2 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLinks.map((link) => (
                      <tr
                        key={link.id}
                        className="border-b border-slate-850 last:border-none"
                      >
                        <td className="py-2 pr-4 font-mono">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/${link.code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:text-sky-300"
                            >
                              {baseUrl}/{link.code}
                            </a>
                            <CopyButton text={`${baseUrl}/${link.code}`} />
                          </div>
                        </td>
                        <td className="py-2 pr-4 max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-200 hover:text-sky-300 truncate"
                            >
                              {link.url}
                            </a>
                            <CopyButton text={link.url} />
                          </div>
                        </td>
                        <td className="py-2 pr-4">{link.clicks}</td>
                        <td className="py-2 pr-4">
                          {new Date(link.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/code/${link.code}`}
                              className="px-2 py-1 rounded-lg border border-slate-700 text-xs hover:border-sky-500 hover:text-sky-300"
                            >
                              Stats
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(link.code)}
                              className="px-2 py-1 rounded-lg border border-red-700 text-xs text-red-300 hover:bg-red-950/40 pointer-events-auto"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <footer className="mt-11 pt-8 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">
            Created by{' '}
            Praveen #Naukri1125
            {' '}–{' '}
            <a
              href="https://github.com/Praveen-jo/tinylink"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Link</h3>
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to delete the link with code{' '}
              <span className="font-mono text-sky-400">"{deleteConfirm}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-sm hover:border-slate-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
