# Deployment Guide for StudySyncAI

This guide provides step-by-step instructions to deploy the StudySyncAI application to production.

---

## 1. Setup Databases and External APIs

### A. MongoDB (Document Database)
1. Sign up/log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. In the Database Access tab, create a new database user and save the password.
4. In Network Access, allow access from anywhere (`0.0.0.0/0`) for hosting platforms.
5. Go to Database -> Connect -> Drivers to copy your connection string (`MONGO_URI`).
   - Replace `<password>` with your database user's password and append `/studysync` to specify the database.

### B. ChromaDB (Vector Store)
To host ChromaDB in production, we run it as a Docker service on Render's free tier using the provided `chromadb-service` config:
- **Using Render**:
  1. Commit and push the new `chromadb-service` folder to your GitHub repository.
  2. Log in to [Render](https://render.com/).
  3. Click **New +** -> **Web Service**.
  4. Select your connected GitHub repository.
  5. Configure the settings:
     - **Name**: `studysync-chromadb`
     - **Environment**: `Docker` (Ensure this is set to **Docker**, which will read our Dockerfile. If you do not see Docker, make sure you pointed to the correct repository containing the `chromadb-service` folder).
     - **Root Directory**: `chromadb-service`
     - **Instance Type**: `Free`
     - **Start Command**: You can leave this **blank** (Render will automatically use the `CMD` defined in our `Dockerfile`). If Render forces you to enter one, use: `uvicorn chromadb.app:app --host 0.0.0.0 --port 10000`
  6. Click **Deploy Web Service**.
  7. Copy the public URL provided by Render (e.g., `https://studysync-chromadb.onrender.com`). This will be your `CHROMADB_URL`.


### C. Google Gemini API
1. Visit the [Google AI Studio](https://aistudio.google.com/).
2. Generate an API Key. This will be your `GOOGLE_API_KEY`.

---

## 2. Deploy Backend API

Deploy the Express backend to a hosting service (e.g., **Render**, **Railway**, **Heroku**).

### Deployment Steps (e.g. Render)
1. Link your GitHub repository to [Render](https://render.com/).
2. Create a new **Web Service**.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add the following **Environment Variables**:
   - `MONGO_URI` = `your_mongodb_atlas_connection_string`
   - `GOOGLE_API_KEY` = `your_gemini_api_key`
   - `CHROMADB_URL` = `your_chromadb_instance_url` (from Step 1B)
   - `PORT` = `5000`
7. Render will provide a public URL (e.g., `https://studysync-backend.onrender.com`).

---

## 3. Deploy Frontend Web App

Deploy the Vite React frontend to **Vercel** or **Netlify**.

### Deployment Steps (e.g. Vercel)
1. Link your GitHub repository to [Vercel](https://vercel.com/).
2. Create a new project, select the repo, and set the Root Directory to `frontend`.
3. Vercel will automatically detect Vite. Keep the default build and install commands.
4. Add the following **Environment Variable**:
   - `VITE_API_URL` = `https://studysync-backend.onrender.com/api` (use your deployed backend URL from Step 2, appending `/api`)
5. Click **Deploy**.
