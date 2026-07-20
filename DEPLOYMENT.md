# StudyOS - Zero-Cost Production Deployment Guide

This guide provides step-by-step instructions to publicly deploy the **StudyOS MERN Application** completely free of charge.

## Stack Overview
- **Database**: MongoDB Atlas (Free M0 Shared Cluster)
- **Backend API**: Render Web Services (Node.js + Express)
- **Frontend SPA**: Vercel (Vite + React 19)

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Free M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g. `studyos_user`) and password.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
5. Click **Connect** → **Drivers** and copy your MongoDB connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/studyos?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render

1. Push your repository to **GitHub**.
2. Log in to [Render](https://render.com) and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the root directory to `server`.
5. Configure the following deployment settings:
   - **Name**: `studyos-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Add the following **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI from Step 1*
   - `JWT_SECRET`: *A secure random string*
   - `CLIENT_URL`: `https://<your-vercel-app>.vercel.app` *(update after Step 3)*
7. Click **Create Web Service**. Note down your deployed API URL (e.g. `https://studyos-api.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. Select the `client` directory as the Root Directory.
4. Configure Build and Output Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL`: `https://studyos-api.onrender.com/api` *(replace with your actual Render API URL)*
6. Click **Deploy**.

---

## Step 4: Verification & Final Step

1. Copy your final live Vercel URL (e.g. `https://studyos.vercel.app`).
2. Go back to **Render** → **Environment** and set `CLIENT_URL` to your Vercel URL.
3. Visit your live Vercel app URL in the browser, create an account, and verify all 6 modules (Timetable, Planner, Courses, Goals, Consistency Tracker, Analytics) are communicating smoothly!

---

## Summary of Environment Variables

### Backend (`server/.env`)
| Variable | Value Description | Example |
| :--- | :--- | :--- |
| `PORT` | Node server port | `5000` |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/studyos` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `supersecretkey123` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `https://studyos.vercel.app` |

### Frontend (`client/.env.production`)
| Variable | Value Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Full URL to Render backend API | `https://studyos-api.onrender.com/api` |
