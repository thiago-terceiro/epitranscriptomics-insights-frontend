# Epitranscriptomics Insights Frontend

This is the Next.js frontend for the Epimod epitranscriptomics pipeline. It provides the upload, results, AlphaFold3, and collaboration interfaces that proxy into the backend services.

## Getting Started

Run the development server:

```bash
pnpm dev
```

You can also use `npm run dev`, `yarn dev`, or `bun dev` if that matches your local workflow.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment

The frontend expects these server-side environment variables:

- `BACKEND_URL`: Required in production. Backend HTTP base URL. Defaults to `http://localhost:8080` in development only.
- `COLLAB_BACKEND_WS_URL`: Optional explicit WebSocket base URL for collaboration. If omitted, it is derived from `BACKEND_URL`.
- `ENABLE_DEV_MOCK_ROUTES`: Optional development-only flag. Set to `true` to expose the mock job submission route and upload UI toggle.
- `ENABLE_ALPHAFOLD3_DEMO`: Optional development-only flag. Set to `true` to allow AlphaFold3 demo responses when the backend proxy is unavailable.
- `ALPHAFOLD3_PROXY`: Optional flag. Set to `true` to proxy AlphaFold3 requests to the backend.

Production builds fail closed when required backend URLs are missing, and mock or demo routes stay disabled unless explicitly enabled in development.

## Project Context

This frontend is part of a containerized RNA modification detection pipeline built around Oxford Nanopore direct RNA sequencing workflows.

The broader system includes these backend capabilities:

- FastAPI APIs for submissions, results, and collaboration.
- Worker pipelines for CHEUI, m6Anet, xPore, and related processing steps.
- Object storage, relational metadata storage, and observability services.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
