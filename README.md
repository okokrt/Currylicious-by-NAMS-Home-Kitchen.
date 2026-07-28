# Remix Currylicious by NAMS Home Kitchen 2.0

Mobile-optimized restaurant application for Currylicious by NAMS Home Kitchen. View menu, manage custom dishes, add favorites, and place seamless WhatsApp orders.

## Deploying to Vercel

This project is pre-configured for seamless deployment on **Vercel** with both static frontend assets and Express API serverless functions.

### Option 1: Deploy via Vercel Dashboard & GitHub

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and select **Import Project**.
3. Select your repository.
4. **Environment Variables**:
   - Set `GEMINI_API_KEY` in the Environment Variables section (Required for AI dish descriptions and food pairing suggestions).
5. Click **Deploy**.

Vercel will automatically apply the pre-configured deployment settings from `vercel.json`:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Serverless API Routes**: Handled via `api/index.ts` for all `/api/*` requests.

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy directly from your terminal:
   ```bash
   vercel
   ```
3. Set your `GEMINI_API_KEY` in the project settings on Vercel.

## Local & Container Development

To run locally in dev mode:
```bash
npm run dev
```

To build and start the server:
```bash
npm run build
npm start
```
