// app/code/[code]/page.js
import prisma from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '../../CopyButton';
import StatsPageClient from './StatsPageClient';

export default async function CodeStatsPage({ params }) {
  const { code } = await params;

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const shortUrl = `${baseUrl}/${link.code}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Link Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Detailed statistics for your short link
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          {/* Short URL Section */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Short URL
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <a
                href={`/${link.code}`}
                target="_blank"
                rel="noreferrer"
                className="text-lg sm:text-xl font-mono text-sky-400 hover:text-sky-300 break-all flex-1"
              >
                {shortUrl}
              </a>
              <CopyButton text={shortUrl} />
            </div>
          </div>

          {/* Destination URL Section */}
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Destination URL
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 break-all flex-1"
              >
                {link.url}
              </a>
              <CopyButton text={link.url} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-sky-500/10 to-sky-600/5 rounded-xl p-4 border border-sky-500/20">
              <p className="text-xs text-slate-400 mb-1">Total Clicks</p>
              <p className="text-3xl font-bold text-sky-400">{link.clicks}</p>
              <p className="text-xs text-slate-500 mt-1">
                {link.clicks === 1 ? 'click' : 'clicks'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-4 border border-emerald-500/20">
              <p className="text-xs text-slate-400 mb-1">Last Clicked</p>
              <StatsPageClient lastClickedAt={link.lastClickedAt} />
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-4 border border-purple-500/20">
              <p className="text-xs text-slate-400 mb-1">Created</p>
              <StatsPageClient createdAt={link.createdAt} />
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-1">Link Code</p>
                <p className="font-mono text-slate-200">{link.code}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Link ID</p>
                <p className="font-mono text-slate-200 text-xs">#{link.id}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
