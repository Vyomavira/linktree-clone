# Branch — Linktree Clone

A full-stack link-in-bio app built with React, Vite, Tailwind CSS, Express, and MongoDB.

## Requirements

- Node.js 20.19+ or 22.12+
- A MongoDB Atlas cluster and connection URI

## Setup

1. Install the client dependencies:

   ```sh
   cd client
   npm.cmd install
   ```

2. Install the server dependencies:

   ```sh
   cd ../server
   npm.cmd install
   ```

3. Configure `server/.env`:

   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/linktree?retryWrites=true&w=majority
   ```

   Replace the placeholder URI with your MongoDB Atlas connection string. Keep this file private; it is excluded by `.gitignore`.

## Open the app in your browser

Do **not** use VS Code's **Go Live** button (Live Server) for this project. It serves files as static HTML, but this React app needs Vite to compile and serve the frontend.

In VS Code, open the project folder, then open a terminal (**Terminal → New Terminal**). Start the frontend:

```powershell
cd client
npm.cmd run dev
```

Wait until Vite prints a local address, usually `http://localhost:5173/`, then **Ctrl+click that address** in the terminal or copy it into your browser. Keep this terminal running while you use the app.

## Start the API

Profile creation, loading, and link management also need the API and MongoDB Atlas. Configure `server/.env` with a valid Atlas URI first, then open a second terminal at the project root and run:

```powershell
cd server
npm.cmd run dev
```

The API listens at `http://localhost:5000`. Keep this terminal running too. The frontend can open without the API, but profile requests will show an error until the API connects to MongoDB.

## Deploy the API to Render

1. Push the project to GitHub and connect the repository in Render using **New → Web Service**.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add `MONGO_URI` under the service's environment variables. Use your MongoDB Atlas connection URI as a secret; do not commit it or put it in a frontend variable.
5. Create the service and wait for its deploy to finish. Copy its public URL, for example `https://your-service.onrender.com`.

Render provides `PORT` automatically. The server connects to MongoDB before it starts accepting requests. Ensure your Atlas network access settings allow connections from the Render service.

> Render's free web services may spin down after inactivity, so the first request can be delayed. Choose a plan that supports always-on services if you require guaranteed 24/7 availability.

## Deploy the frontend to Vercel

The frontend is configured for Vercel SPA routing. Deploy the API to Render first so you can set the production API URL in Vercel.

1. Import the GitHub repository in Vercel.
2. Set **Root Directory** to `client` and use the **Vite** framework preset. The build command is `npm run build`; the output directory is `dist`.
3. Add the environment variable `VITE_API_URL` using the Render service's public base URL (for example, `https://your-service.onrender.com`, without a trailing slash or `/api`).
4. Deploy or redeploy the Vercel project after setting `VITE_API_URL`.

The frontend uses `http://localhost:5000` as its default API during local development. Vite embeds `VITE_API_URL` at build time for production. Do not put the MongoDB URI in a `VITE_` variable; frontend variables are public.

## Troubleshooting

- **The browser shows source code, a blank page, or a MIME/module error:** make sure you opened the URL printed by `npm.cmd run dev`, not the `client/index.html` file or Live Server URL.
- **`npm` is not recognized in PowerShell:** use `npm.cmd` as shown above.
- **The page opens but profile actions fail:** check that the API terminal is running and `server/.env` contains a valid MongoDB Atlas URI. The example URI is only a placeholder.
- **Port 5173 is already in use:** Vite prints the alternate local URL it selected; open that URL instead.

## Features

- Create and edit a profile with a unique username, bio, photo URL, and social URLs
- Add and remove profile links
- Live dashboard preview
- Public profile pages at `/u/:username`
- MongoDB persistence through the Express API
