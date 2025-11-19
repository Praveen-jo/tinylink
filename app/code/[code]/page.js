// app/code/[code]/page.js
import prisma from '../../../lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CodeStatsPage({ params }) {
  const { code } = await params;

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">TinyLink – Stats</h1>
          <Link
            href="/"
            className="text-sm text-sky-400 hover:text-sky-300 underline"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Short URL
            </p>
            <p className="text-lg font-mono">
              {baseUrl}/{link.code}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Destination
            </p>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 break-all hover:text-sky-300"
            >
              {link.url}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
              <p className="text-xs text-slate-400">Total Clicks</p>
              <p className="text-2xl font-semibold mt-1">{link.clicks}</p>
            </div>
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
              <p className="text-xs text-slate-400">Last Clicked</p>
              <p className="mt-1">
                {link.lastClickedAt
                  ? new Date(link.lastClickedAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div>
              <p>Created at</p>
              <p>{new Date(link.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p>Updated at</p>
              <p>{new Date(link.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
