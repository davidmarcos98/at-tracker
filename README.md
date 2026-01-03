This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Nadeo API Setup

This project fetches Track of the Day (TOTD) maps from the Nadeo API using a dedicated server account. The endpoint `/api/nadeo/totd` returns a list of TOTD maps.

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Nadeo OAuth server account credentials
NADEO_CLIENT_ID=<your_server_account_client_id>
NADEO_CLIENT_SECRET=<your_server_account_client_secret>

# Nadeo API endpoints
NADEO_TOKEN_ENDPOINT=https://nadeo.example/oauth/token
NADEO_API_BASE=https://api.nadeo.example
```

- `NADEO_CLIENT_ID` and `NADEO_CLIENT_SECRET` are credentials for your dedicated Nadeo server account.
- `NADEO_TOKEN_ENDPOINT` is the Nadeo OAuth token endpoint (used for client credentials flow).
- `NADEO_API_BASE` is the base URL for the Nadeo API.

### Testing TOTD Endpoint

Once the development server is running (`npm run dev`), test the endpoint:

```bash
curl http://localhost:3000/api/nadeo/totd
```

Expected response:
```json
{
  "ok": true,
  "maps": [
    {
      "id": "map_id",
      "title": "Map Title",
      "author": "Author Name",
      "uploadDate": "2026-01-03T12:00:00Z",
      "thumbnailUrl": "https://..."
    }
  ]
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
