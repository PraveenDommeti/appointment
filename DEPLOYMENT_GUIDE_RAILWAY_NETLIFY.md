# Deployment Guide: Railway (Backend) + Netlify (Frontend)

This guide will help you deploy your full-stack application.

## Part 1: Deploy Backend to Railway

1.  **Push your code to GitHub** if you haven't already.
2.  **Sign up/Login to [Railway](https://railway.app/)**.
3.  **Create a New Project**:
    *   Click "New Project" -> "Deploy from GitHub repo".
    *   Select your repository.
    *   **Important**: Click "Add Variables" or "Settings" before deploying to configure the **Root Directory**.
    *   Go to **Settings** -> **Root Directory** and set it to `/server`.
4.  **Add a Database**:
    *   In your project view (Canvas), right-click -> "Database" -> "MySQL".
    *   This will create a MySQL service.
5.  **Connect Backend to Database**:
    *   Click on your **MySQL** service -> "Variables".
    *   Copy the `MYSQL_URL` or individual variables (Host, User, Password, etc.).
    *   Click on your **NodeJS (Backend)** service -> "Variables".
    *   Add the following variables (matching your local `.env` logic but using Railway's values):
        *   `DB_HOST`: (From MySQL service)
        *   `DB_USER`: (From MySQL service)
        *   `DB_PASSWORD`: (From MySQL service)
        *   `DB_NAME`: (From MySQL service)
        *   `DB_PORT`: `3306`
        *   `JWT_SECRET`: (Create a random secret key)
        *   `PORT`: `3001` (Or let Railway assign one, but usually it respects the environment variable `PORT` automatically). 
        *   **Note**: Railway provides a `PORT` variable automatically, ensure your code listens on `process.env.PORT` (which it does).
6.  **Initialize Database**:
    *   Copy the content of `server/seed_data.sql`.
    *   In Railway, click the **MySQL** service -> "Data" tab.
    *   Paste and run the SQL to create your tables and initial users.
7.  **Generate Public Domain**:
    *   Click on your **NodeJS (Backend)** service -> "Settings" -> "Networking".
    *   Click "Generate Domain".
    *   Copy this URL (e.g., `https://web-production-1234.up.railway.app`).

## Part 2: Deploy Frontend to Netlify

1.  **Login to [Netlify](https://www.netlify.com/)**.
2.  **Add New Site**:
    *   "Import from Git" -> Select your repository.
3.  **Configure Build**:
    *   **Base directory**: (Leave empty or `/` if it's the root).
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
4.  **Set Environment Variables**:
    *   Click "Site configuration" -> "Environment variables".
    *   Add a new variable:
        *   **Key**: `VITE_API_URL`
        *   **Value**: Your Railway Backend URL + `/api` (e.g., `https://web-production-1234.up.railway.app/api`)
5.  **Deploy**:
    *   Click "Deploy site".

## Part 3: Verify

1.  Open your Netlify URL.
2.  Try to login. The frontend will now make requests to your Railway backend.
3.  **Troubleshooting**:
    *   If you get CORS errors, you might need to update the allowed origins in `server/server.js`. Currently `app.use(cors())` allows all origins, so it should work fine.
