# Run ProcureFlow on Windows without Docker

## 1. Install prerequisites

- Java 21 JDK
- Maven 3.9+
- Node.js 22 LTS
- PostgreSQL 16+

Check versions in Command Prompt:

```bat
java -version
mvn -version
node -v
npm -v
psql --version
```

## 2. Create local database

```sql
CREATE USER procureflow_app WITH PASSWORD 'replace-with-a-local-secret';
CREATE DATABASE procureflow OWNER procureflow_app;
```

## 3. Start backend

```bat
cd backend
set DB_URL=jdbc:postgresql://localhost:5432/procureflow
set DB_USERNAME=procureflow_app
set DB_PASSWORD=replace-with-a-local-secret
set COOKIE_SECURE=false
set APP_CORS_ORIGIN=http://localhost:4200
mvn spring-boot:run
```

Wait for Spring Boot to report that the application started. Flyway runs the database migrations on startup.

## 4. Start frontend in a second terminal

```bat
cd frontend
npm install
npm start
```

Open `http://localhost:4200`, create an account and company workspace, sign in, then choose a workspace.

## 5. Stop

Press `Ctrl+C` in both terminal windows. PostgreSQL remains installed as a local service.

**Do not use real customer data.** The milestone is still awaiting successful dependency installation, build/test verification, email verification, rate limiting, MFA and PostgreSQL RLS.
