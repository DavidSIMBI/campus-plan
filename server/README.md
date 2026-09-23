# CampusPlan Authentication Backend

This is the first backend milestone for CampusPlan. It handles student registration, login, JWT authentication, and the current student's safe profile. Assignments, tests, timetable, calendar, messaging, and other academic data remain in the existing frontend localStorage prototype.

## 1. Install dependencies

Open PowerShell in the `server` folder:

```powershell
npm install
```

## 2. Create the MySQL database

Make sure MySQL is running, then run the SQL file with a MySQL client:

```powershell
mysql -u root -p < database.sql
```

On Windows PowerShell, if input redirection is unavailable in your shell, open MySQL and run:

```sql
SOURCE C:/Users/TechMedia/Desktop/Campusplan project/server/database.sql;
```

The script creates the `campusplan` database and only the initial `users` table.

## 3. Configure environment variables

Copy `.env.example` to `.env` and set the MySQL username/password and a private development JWT secret:

```powershell
Copy-Item .env.example .env
```

Do not commit `.env`.

## 4. Start the backend

From the `server` folder:

```powershell
npm start
```

The API runs at `http://localhost:5000` by default. Check it with:

```text
http://localhost:5000/api/health
```

## 5. Endpoints

- `POST /api/auth/register`: creates a student account and hashes the password with bcrypt.
- `POST /api/auth/login`: accepts an email or student ID plus password and returns a JWT.
- `GET /api/auth/me`: returns the safe profile for a valid `Authorization: Bearer <token>` request.

## 6. Frontend connection

The existing `login.html` and `register.html` forms still use their original IDs and layout. `js/script.js` sends their data to `http://localhost:5000/api/auth`. The JWT is stored in `campusplan_auth_token` for this local development prototype, and the existing session key is retained for the rest of the frontend pages.

If the API is not running, the frontend temporarily falls back to its previous localStorage authentication so the rest of the prototype remains usable. This fallback should be removed when the backend is permanently available.

Run the frontend with Live Server, commonly at `http://localhost:5500`, and ensure that origin is listed in `FRONTEND_ORIGINS`.
