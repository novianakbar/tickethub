# TicketHub - Open Source Ticketing System

A modern, self-hosted ticketing system built with Next.js, PostgreSQL, and Prisma.

## Features

- 🎫 Multi-level ticket management (L1/L2/L3 support)
- 👥 User roles (Admin & Agent)
- 📁 Category-based ticket organization
- 📎 File attachments (S3-compatible storage)
- 🔐 Secure authentication with NextAuth.js
- 🌙 Dark/Light mode support
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS + Radix UI
- **File Storage**: S3-compatible (Cloudflare R2, AWS S3, MinIO)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- S3-compatible storage (optional, for attachments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/ticket-oss.git
cd ticket-oss
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
cp .env.example .env.local
```

Edit `.env` and `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tickethub"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-min-32-chars-here"
NEXTAUTH_URL="http://localhost:3000"

# S3 Storage (optional)
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=
```

4. Set up the database:
```bash
npx prisma db push
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Login Credentials

After seeding, you can login with:

| Role  | Email                | Username | Password  |
|-------|----------------------|----------|-----------|
| Admin | admin@tickethub.com  | admin    | admin123  |
| Agent | agent1@tickethub.com | agent1   | agent123  |
| Agent | agent2@tickethub.com | agent2   | agent123  |
| Agent | agent3@tickethub.com | agent3   | agent123  |

**⚠️ Change these passwords in production!**

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── (public)/         # Public pages
│   ├── admin/            # Admin dashboard
│   └── api/              # API routes
├── components/           # React components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and seed
└── public/               # Static assets
```

## License

MIT
