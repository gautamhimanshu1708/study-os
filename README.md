# StudyOS 🚀

> A premium SaaS-like study management platform built with the MERN stack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt |
| State | React Context API |
| Routing | React Router DOM v6 |
| HTTP | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |

## Project Structure

```
study os/
├── server/          # Express API
│   ├── config/      # DB connection
│   ├── controllers/ # Route handlers
│   ├── middleware/  # JWT auth guard
│   ├── models/      # Mongoose schemas
│   ├── routes/      # Express routes
│   └── utils/       # JWT helper
│
└── client/          # React + Vite app
    └── src/
        ├── api/         # Axios instance
        ├── components/  # UI + layout components
        ├── context/     # Auth context
        ├── hooks/       # useAuth
        └── pages/       # Route pages
```

## Getting Started

### 1. Configure Backend

```bash
cd server
# Edit .env — replace MONGO_URI with your Atlas connection string
npm run dev
```

### 2. Start Frontend

```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend API at `http://localhost:5000`

> The Vite dev server proxies `/api/*` to the backend — no CORS issues.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/update-profile` | ✅ | Update name/avatar |
| POST | `/api/auth/forgot-password` | ❌ | Request reset token |
| PUT | `/api/auth/reset-password/:token` | ❌ | Reset password |

## Environment Variables

Copy `server/.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/studyos
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
