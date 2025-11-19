// app/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default function DashboardPage() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } catch (err) {
      console.error('Error loading links:', err);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

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

  async function handleDelete(codeToDelete) {
    if (!confirm(`Delete link with code "${codeToDelete}"?`)) return;

    const res = await fetch(`/api/links/${codeToDelete}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setLinks((prev) => prev.filter((l) => l.code !== codeToDelete));
    } else {
      alert('Failed to delete link');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <main className="max-w-5xl mx-auto px-4 py-10">
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
            Assignment – Full Stack Developer
          </span>
        </header>

        <section className="mb-8">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
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
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
                  {baseUrl}/
                </span>
                <input
                  type="text"
                  placeholder="6–8 letters/numbers"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500">
                Must match: <code>[A-Za-z0-9]&#123;6,8&#125;</code>. Leave empty to auto-generate.
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
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 px-4 py-2 text-sm font-medium shadow-lg shadow-sky-500/20"
            >
              {loading ? 'Creating…' : 'Create short link'}
            </button>
          </form>
        </section>

        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">All links</h2>
            <span className="text-xs text-slate-500">
              {links.length} total
            </span>
          </div>

          {links.length === 0 ? (
            <p className="text-sm text-slate-500">
              No links yet. Create your first one above.
            </p>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-800">
                    <th className="py-2 pr-4">Short URL</th>
                    <th className="py-2 pr-4">Destination</th>
                    <th className="py-2 pr-4">Clicks</th>
                    <th className="py-2 pr-4">Last clicked</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b border-slate-850 last:border-none"
                    >
                      <td className="py-2 pr-4 font-mono">
                        <a
                          href={`/${link.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:text-sky-300"
                        >
                          {baseUrl}/{link.code}
                        </a>
                      </td>
                      <td className="py-2 pr-4 max-w-xs truncate">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-200 hover:text-sky-300"
                        >
                          {link.url}
                        </a>
                      </td>
                      <td className="py-2 pr-4">{link.clicks}</td>
                      <td className="py-2 pr-4">
                        {link.lastClickedAt
                          ? new Date(link.lastClickedAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-2 pr-2 text-right space-x-2">
                        <Link
                          href={`/code/${link.code}`}
                          className="px-2 py-1 rounded-lg border border-slate-700 text-xs hover:border-sky-500 hover:text-sky-300"
                        >
                          Stats
                        </Link>
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="px-2 py-1 rounded-lg border border-red-700 text-xs text-red-300 hover:bg-red-950/40"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
