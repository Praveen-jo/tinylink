import prisma from '../../../lib/prisma';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

// helper to generate random code
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// simple URL validation
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(links, { status: 200 });
  } catch (err) {
    console.error('GET /api/links error', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    let { url, code } = body;

    if (!url || typeof url !== 'string') {
      return Response.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return Response.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // if custom code is provided
    if (code && typeof code === 'string') {
      code = code.trim();
      if (!CODE_REGEX.test(code)) {
        return Response.json(
          { error: 'Code must be 6–8 alphanumeric characters' },
          { status: 400 }
        );
      }

      const existing = await prisma.link.findUnique({
        where: { code },
      });

      if (existing) {
        // requirement: duplicate → 409
        return Response.json(
          { error: 'Code already exists' },
          { status: 409 }
        );
      }
    } else {
      // auto-generate a code
      for (let i = 0; i < 5; i++) {
        const candidate = generateCode(6);
        const existing = await prisma.link.findUnique({
          where: { code: candidate },
        });
        if (!existing) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        return Response.json(
          { error: 'Failed to generate code' },
          { status: 500 }
        );
      }
    }

    const link = await prisma.link.create({
      data: { code, url },
    });

    return Response.json(link, { status: 201 });
  } catch (err) {
    console.error('POST /api/links error', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
