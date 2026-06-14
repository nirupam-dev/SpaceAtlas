# SpaceAtlas

SpaceAtlas is a comprehensive space encyclopedia and rocket information platform built with Next.js 15, Tailwind CSS, Prisma, and Framer Motion.

## Features

- **Space Database**: Explore rockets, missions, planets, astronauts, and agencies.
- **Comparison Tool**: Compare different rockets side-by-side with key metrics.
- **Interactive Quizzes**: Test your knowledge about space history and the solar system.
- **Launch Tracker**: See upcoming rocket launches and live countdowns.
- **Space News**: Stay updated with the latest happenings in space exploration.
- **Stunning UI**: Dark space theme, glassmorphism effects, dynamic star field background.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database ORM**: Prisma
- **Data Source**: Statically seeded fallback + NASA/SpaceX API support structure

## Getting Started

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
Copy `.env.example` to `.env.local` and add your database URL (if using PostgreSQL).

```bash
cp .env.example .env.local
```

3. **Database Setup (Optional)**
If you want to use the PostgreSQL database instead of the local fallback data:
```bash
npx prisma generate
npx prisma db push
```

4. **Run the Development Server**
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/prisma` - Database schema and configurations
- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable UI components (Cards, StarField, Navbar, Footer)
- `/src/lib` - Utility functions and static data store

## Deployment

The application is configured and ready to be deployed on Vercel. 
Push your code to a Git repository and import it into Vercel.
Make sure to add the necessary environment variables (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`) in the Vercel project settings.
