# CampusPlan Authentication Backend

This backend milestone handles student registration, login, JWT authentication, the current student's safe profile, assignments, tests, and presentations. Timetable, calendar, messaging, groups, notifications, reminders, and other academic data remain in the existing frontend localStorage prototype.

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

The script creates the `campusplan` database, keeps the existing `users` table, and adds the user-owned `assignments` table if it does not exist. It does not reset existing data.

After the main schema has been installed, add the Tests table without resetting existing data:

```powershell
mysql -u root -p campusplan < database_tests.sql
```

Or from the MySQL client:

```sql
SOURCE C:/Users/TechMedia/Desktop/Campusplan project/server/database_tests.sql;
```

Add the Presentations table without resetting existing data:

```powershell
mysql -u root -p campusplan < database_presentations.sql
```

Or from the MySQL client:

```sql
SOURCE C:/Users/TechMedia/Desktop/Campusplan project/server/database_presentations.sql;
```

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
- `GET /api/assignments`: returns assignments owned by the authenticated student.
- `POST /api/assignments`: creates an assignment for the authenticated student.
- `GET /api/assignments/:id`: returns one owned assignment.
- `PUT /api/assignments/:id`: updates one owned assignment.
- `DELETE /api/assignments/:id`: deletes one owned assignment.
- `GET /api/tests`: returns tests owned by the authenticated student.
- `POST /api/tests`: creates a test for the authenticated student.
- `GET /api/tests/:id`: returns one owned test.
- `PUT /api/tests/:id`: updates one owned test.
- `DELETE /api/tests/:id`: deletes one owned test.
- `GET /api/presentations`: returns presentations owned by the authenticated student.
- `POST /api/presentations`: creates a presentation for the authenticated student.
- `GET /api/presentations/:id`: returns one owned presentation.
- `PUT /api/presentations/:id`: updates one owned presentation.
- `DELETE /api/presentations/:id`: deletes one owned presentation.

## 6. Frontend connection

The existing `login.html` and `register.html` forms still use their original IDs and layout. `js/script.js` sends their data to `http://localhost:5000/api/auth`, and the assignments and tests pages send authenticated requests to their corresponding API routes. The JWT is stored in `campusplan_auth_token` for this local development prototype, and the existing session key is retained for the rest of the frontend pages.

### Existing local assignments

When an authenticated student opens Assignments for the first time, any existing assignments under that student's old localStorage key are uploaded one by one. The old key is removed only after every upload and the first backend load succeeds. If the server or database is unavailable, the old local data is left untouched so it can be retried safely.

If the API is not running, the frontend temporarily falls back to its previous localStorage authentication so the rest of the prototype remains usable. This fallback should be removed when the backend is permanently available.

When an authenticated student opens Tests or Presentations for the first time, old records under that student's localStorage key are uploaded only after the API is reachable. Each old key is removed only after every import succeeds. A local compatibility cache is refreshed after successful API reads so the existing Calendar view can continue using its current frontend data path until Calendar is migrated.

Run the frontend with Live Server, commonly at `http://localhost:5500`, and ensure that origin is listed in `FRONTEND_ORIGINS`.
