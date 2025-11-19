// app/[code]/page.js
import prisma from '../../lib/prisma';
import { redirect, notFound } from 'next/navigation';

export default async function CodeRedirectPage({ params }) {
  const { code } = await params;

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link) {
    // 404 if code not found
    notFound();
  }

  // update click count + lastClickedAt
  await prisma.link.update({
    where: { code },
    data: {
      clicks: { increment: 1 },
      lastClickedAt: new Date(),
    },
  });

  // 302 redirect to the original URL
  redirect(link.url);
}
