# Tutor Platform Backend (Express + MongoDB)

## Quick start

1. Copy this folder to your machine.
2. Create a `.env` file (you can copy `.env.example`) and fill in `MONGO_URI` and `JWT_SECRET`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. API endpoints:
   - POST /api/auth/signup  -> { name, email, password, role }
   - POST /api/auth/login   -> { email, password }
   - POST /api/requests     -> { teacherId, message } (Authorization: Bearer <token>)
   - GET  /api/requests     -> (for teacher) list requests for logged-in teacher
   - PATCH /api/requests/:requestId -> { status } to accept/reject

