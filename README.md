# ScheduleIt - UMD Course Schedule Builder

A smart course scheduling assistant for UMD students that helps build optimal schedules based on preferences, friend coordination, and course data.

## Features

- Natural language input for schedule preferences
- Course conflict detection with friends' schedules
- CS track requirement tracking
- Integration with PlanetTerp API for grade averages
- Integration with UMD.io API for real-time course availability
- Smart schedule sorting based on multiple criteria
- Friend coordination for shared free times

## Tech Stack

- Frontend: Next.js + React
- API Integration: PlanetTerp, UMD.io
- Natural Language Processing: Gemini AI

## Getting Started

First, set up your environment variables:

```bash
cp .env.example .env.local
```

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
