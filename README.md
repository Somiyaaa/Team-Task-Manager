# Team Task Manager

A production-ready full-stack web application for managing projects, team members, and tasks with role-based access control.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS v4, Context API, Axios, react-hot-toast
- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT Authentication, Zod Validation

## Features
- JWT Authentication (Login/Register)
- Role-based Access Control (ADMIN vs MEMBER)
- Projects and Tasks Management
- Real-time Status updates
- Dashboard with dynamic stats
- PostgreSQL integration via Prisma

## Local Setup Instructions

### 1. Database Setup
Ensure you have Docker installed and run the provided `docker-compose.yml`:
```bash
docker-compose up -d
```
This spins up a PostgreSQL instance on port `5432` with credentials: `admin` / `password` / `taskmanager`.

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
Backend runs on `http://localhost:5000`. Environment variables are pre-configured in `backend/.env`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

## Deployment Instructions

### Backend (Railway)
1. Push your code to GitHub.
2. Link your GitHub repo to Railway.
3. Add a PostgreSQL database add-on in Railway.
4. Set the following Environment Variables in Railway:
   - `DATABASE_URL`: (provided by Railway Postgres)
   - `JWT_SECRET`: a secure random string
   - `PORT`: (Railway automatically assigns this, but you can set it if needed)
5. Set your start command to: `npx prisma generate && npx prisma db push && npm run build && npm start`.
   - Ensure `package.json` has `"start": "node dist/index.js"` and `"build": "tsc"`.

### Frontend (Vercel)
1. Import your GitHub repository to Vercel.
2. Select the `frontend` folder as the Root Directory.
3. Vercel automatically detects Next.js.
4. Add the Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your live Railway backend URL (e.g., `https://your-backend.up.railway.app/api`)
5. Deploy!

## API Structure
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Authenticate
- `GET /api/auth/me` - Get current user profile
- `GET/POST /api/projects` - Manage projects
- `POST /api/projects/:id/members` - Add members to project
- `GET/POST/PATCH/DELETE /api/tasks` - Manage tasks
