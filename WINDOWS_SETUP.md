# Windows setup (VS Code)

1. Extract the ZIP.
2. Open the `sprintboard` folder in VS Code.
3. In PowerShell, run:
   ```powershell
   npm install
   npm install --prefix server
   npm install --prefix client
   Copy-Item server/.env.example server/.env
   ```
4. Edit `server/.env`. Set `MONGODB_URI` to your local MongoDB URI or Atlas connection string. Replace `JWT_SECRET` with a random secret of at least 32 characters.
5. Make sure MongoDB is running or your Atlas database allows your current IP.
6. Start the app:
   ```powershell
   npm run dev
   ```
7. Open http://localhost:5173 and create an account.

If PowerShell says a port is already in use, close the other process or change `PORT` in server/.env and update the Vite proxy target in client/vite.config.js to match.

Never share your real `.env` file or commit it to Git.
