# SprintBoard

SprintBoard is a collaborative project and issue tracker for small teams. It brings project planning, issue ownership, priorities, progress tracking and a simple activity history into one workspace.

## Features

- Register and sign in with password hashing and JWT-backed HTTP-only cookies.
- Create, update, list and delete projects.
- Create, update, delete and change the status of issues.
- Filter issues by project, status and priority; search by title or description.
- Dashboard counts for projects and issues.
- Activity history on project pages.
- Socket.IO notifications for issue changes while a project is open.
- Ownership checks so users can only access their own projects and related issues.
- Responsive interface with loading, empty and error states.

## Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT, bcryptjs, Zod
- Socket.IO

## Requirements

- Node.js 20 or newer
- npm
- MongoDB local instance or MongoDB Atlas database

## Setup

1. Install root dependencies:

   ```bash
   npm install
   ```

2. Install the backend and frontend dependencies:

   ```bash
   npm install --prefix server
   npm install --prefix client
   ```

3. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

4. Start both applications from the repository root:

   ```bash
   npm run dev
   ```

5. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

The API health endpoint is `http://localhost:5000/api/health`.

## Environment variables

See `server/.env.example`. Never commit real secrets. In production, set `NODE_ENV=production`, configure `CLIENT_URL` to the deployed frontend origin, use HTTPS, and use a managed secret store.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Clear the session cookie |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/projects` | List or create projects |
| GET/PUT/DELETE | `/api/projects/:id` | Read, update or delete a project |
| GET/POST | `/api/issues` | List or create issues |
| GET/PUT/DELETE | `/api/issues/:id` | Read, update or delete an issue |
| PATCH | `/api/issues/:id/status` | Change issue status |
| GET | `/api/dashboard/stats` | Dashboard counts |
| GET | `/api/projects/:id/activities` | Recent project activity |

## Notes

- Authentication uses an HTTP-only cookie rather than storing a bearer token in browser local storage.
- For a production deployment, use HTTPS and review cookie, CORS, rate-limit, logging, backup and monitoring settings for your hosting environment.
- The project is a solid assessment-ready foundation, not a substitute for a deployment-specific security review.
