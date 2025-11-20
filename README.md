TinyLink – URL Shortener
A simple URL shortening service built with Next.js App Router, Neon Postgres, Prisma, and TailwindCSS.

📌 Features

- Create short URLs with custom or auto-generated codes
- Code validation: [A-Za-z0-9]{6,8}
- Track click count and last clicked timestamp
- View per-link analytics
- Delete short links
- /healthz endpoint for health checks

🚀 Tech Stack

- Frontend: Next.js App Router + Tailwind CSS
- Backend: Next.js API Routes
- Database: Postgres (Neon + Vercel Integration)
- ORM: Prisma
- Deployment: Vercel

🧩 API Endpoints
- Create Link - POST /api/links
- List All Links - GET /api/links
- Get Link Stats - GET /api/links/:code
- Delete Link - DELETE /api/links/:code
- Redirect Short URL - GET /:code
- Health Check - GET /healthz

📦 Environment Variables
> Create .env file:
- DATABASE_URL="postgres://username:password@host/dbname?sslmode=require"
- NEXT_PUBLIC_BASE_URL="http://localhost:3000"
- In production, NEXT_PUBLIC_BASE_URL should be: https://your-vercel-url.vercel.app

▶️ Running Locally
- npm install
- npm run dev
- Open: http://localhost:3000/

🗄 Database Setup
- npx prisma migrate dev
- npx prisma generate

🧪 Testing Flow
- Create new link
- Click the short code
- Redirect works
- /code/:code shows analytics
- Delete link
- /healthz returns JSON

📤 Deployment (Vercel)
- Import GitHub repo into Vercel
- Attach Neon Postgres storage
- Add .env variables
- Deploy

✨ Author
-- Praveen – Full Stack Developer Assignment
