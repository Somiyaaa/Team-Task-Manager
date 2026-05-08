# Team Task Manager

A production-ready full-stack web application for managing projects, team members, and tasks with role-based access control.

## Features
- User Authentication
- Project & Task Management
- Dashboard Analytics
- Overdue Task Highlighting
- Role-Based Access

## Tech Stack
Frontend: Next.js + Tailwind CSS
Backend: Node.js + Express
Database: Prisma + SQLite

## Live Demo
Frontend: https://team-task-manager-psi-two.vercel.app/dashboard
Backend: team-task-manager-production-696d.up.railway.app

## Setup Instructions
1. Clone repo
2. Install dependencies
3. Run frontend and backend
5. Set your start command to: `npx prisma generate && npx prisma db push && npm run build && npm start`.
   - Ensure `package.json` has `"start": "node dist/index.js"` and `"build": "tsc"`.
- `GET/POST /api/projects` - Manage projects
- `POST /api/projects/:id/members` - Add members to project
- `GET/POST/PATCH/DELETE /api/tasks` - Manage tasks
