# Movie Tracker App

A simple web application to track movies you want to watch or have already watched. This app allows you to search for movies using the OMDB API, add them to your collection, and track your watch status.

## Features

- Search for movies using the OMDB API
- Add movies to your personal collection
- Mark movies as watched/unwatched
- Data stored in Supabase for cross-device access
- Clean, responsive user interface

## Setup

### Prerequisites

- Node.js (v18+)
- Supabase account
- OMDB API key

### Environment Setup

1. Clone this repository
2. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MOVIE_API_KEY=your_omdb_api_key
```

### Supabase Setup

1. Create a new project in [Supabase](https://app.supabase.com/)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the following SQL to create the necessary table:

```sql
CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  director TEXT,
  image_url TEXT,
  watched BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies (title);
CREATE INDEX IF NOT EXISTS idx_movies_watched ON movies (watched);
```

4. Set up Row Level Security (RLS) for the movies table if needed

### Running the App

1. Install dependencies:
```
npm install
```

2. Run the development server:
```
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js
- React
- Supabase (for backend storage)
- OMDB API (for movie data)
- Tailwind CSS (for styling)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
