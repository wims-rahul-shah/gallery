# Vercel Deployment Guide

This project is now ready to run on **Vercel** using a Docker container.

## Deploy Steps

1. Install Vercel CLI if not already installed:
   ```bash
   npm i -g vercel
   ```

2. From the project root (where `vercel.json` is located), run:
   ```bash
   vercel
   ```

3. Vercel will detect the `Dockerfile` via `vercel.json` and build the container.

4. Once deployed, your ASP.NET Core MVC app will be accessible at:
   ```
   https://<your-vercel-project>.vercel.app
   ```

## Notes

- Vercel provides **ephemeral file storage**. Any files written to disk during runtime will **not persist** between deployments or server restarts.  
  → Use **Azure Blob Storage, Supabase Storage, or S3** for uploaded images.

- Environment variables can be set in the Vercel Dashboard under **Settings → Environment Variables**.

- The app listens on port **8080**, which is the default for Vercel containers.

---

You’re ready to deploy 🚀