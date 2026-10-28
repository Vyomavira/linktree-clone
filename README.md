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
