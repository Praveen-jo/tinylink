import prisma from '../../../../lib/prisma';
import { notFound } from 'next/navigation';

export async function DELETE(request, { params }) {
  try {
    const { code } = await params;

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return Response.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    await prisma.link.delete({
      where: { code },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/links/[code] error', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

