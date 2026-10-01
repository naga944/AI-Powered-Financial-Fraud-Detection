# AI SecurePay - Fraud Detection & Risk Analytics Platform

A responsive web application built with a Node.js backend, SQLite database, and a modern dashboard-first frontend. The project combines user authentication, transaction processing, fraud-risk logic, admin analytics, and a production-ready structure that can be extended further for real ML integration and enterprise-level deployment.

## Project Overview

This project is designed around the following end-to-end flow:

User → Login/Register → Dashboard → Transaction Authorization → Risk Analysis → Database Save → Admin Insights

It is built to demonstrate a real-world financial fraud detection and prevention platform, with a strong focus on:

- Secure authentication
- Transaction management
- Risk analysis
- Fraud prevention logic
- Admin monitoring
- Responsive dashboard UI
- Database-backed data storage
- Scalable backend structure

## Tech Stack

Frontend
- HTML5
- CSS3
- JavaScript
- Responsive mobile-first layout

Backend
- Node.js
- Express.js

Database
- SQLite for local development
- MySQL-ready configuration support

Security
- bcryptjs password hashing
- JWT authentication
- Protected routes
- Authorization checks

Additional
- CORS enabled
- Environment configuration via .env
- REST API routes

## Current Implemented Features

### Authentication
- User signup
- User login
- Password hashing
- JWT generation
- Protected API routes
- Dashboard access after login
- Demo admin user and demo user seeded automatically

### Dashboard
- Responsive dashboard UI
- Action cards for payments and security services
- AI insight section
- Notification support
- Admin dashboard with summary cards
- Charts using Chart.js

### Transactions
- Transaction creation flow
- Authorization confirmation before save
- Risk computation logic
- High-risk detection heuristics
- Database persistence

### Admin Panel
- Admin dashboard page
- Risk summary metrics
- Chart-driven analytics
- Admin-only access check via server-side verification

### Database
- SQLite tables for users, transactions, notifications, and audit logs
- Seed data for demo accounts
- MySQL-compatible schema layout prepared

### Responsive Design
- Desktop-first layout with scalable dashboard cards
- Mobile fallback for smaller screens
- Tablet support via responsive media queries

## Project Structure

```text
AI fraud detection app/
├── admin.html
├── signup.html
├── dashboard.html
├── mobile-verification.html
├── index.html
├── server.js
├── database.js
├── package.json
├── .env.example
├── README.md
├── css/
│   ├── dashboard.css
│   ├── forms.css
│   └── ...
├── js/
│   ├── admin.js
│   ├── auth-client.js
│   ├── signup.js
│   ├── otp.js
│   ├── dashboard.js
│   └── ...
├── images/
└── securepay.sqlite
```

## Default Users

Demo admin:
- Email: admin@securepay.com
- Password: Admin@123

Demo user:
- Email: demo@securepay.com
- Password: SecurePay@123

## Local Run

1. Open the project folder.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node server.js
```

4. Open in browser:

```text
http://localhost:3000/mobile-verification.html
```

## Deploy to Render

Create a new Render web service from this repository and select **Blueprint** so Render applies `render.yaml`. The service installs with `npm ci`, starts with `npm start`, and Render generates `JWT_SECRET` automatically. Keep that secret stable across deploys so existing login tokens remain valid.

SQLite works for demos, but its data is not durable on Render's default filesystem. To keep data across deploys, attach a persistent disk and set `DB_FILE` to a path on its mount (for example, `/var/data/securepay.sqlite`).

## Environment Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=3000
JWT_SECRET=your_secret_key
DB_TYPE=sqlite
FASTAPI_URL=http://localhost:8000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=ai_securepay
```

## Production-Ready Scope Covered by This Project

This project includes the major foundation required for a real production application:

- Frontend + backend
- Database persistence
- User authentication and login
- Protected routes
- Admin dashboard
- Transaction processing
- Risk logic
- Search and UI structure
- Responsive behavior for desktop/mobile/tablet
- Scalable project structure

## Additional Features Required for Full Enterprise Expansion

The following items are part of the full final-year project vision and can be extended with additional modules:

- Real AI/ML model integration using FastAPI
- Paysim dataset preprocessing and model training
- Real-time prediction API integration
- Explainable AI / SHAP reasoning
- PDF/Excel/CSV reports
- Email and SMS notifications
- Blacklist and fraud accounts
- Audit logs and admin activity tracking
- User profile settings and account management
- Full CRUD admin pages for users and records
- More advanced analytics and charts
- Separate production and development database setup
- Deployment environment setup

## Architecture Assumption

This project follows a practical architecture where the frontend is static HTML/CSS/JavaScript and the backend is a Node.js Express API. This is a sensible, fast, maintainable implementation for a local app and demo project. For larger production deployment, the frontend can later be migrated to React/Next.js or another framework while keeping the same API design.

## Security Notes

- Passwords are stored as hashes, never plain text
- JWT tokens are required for protected endpoints
- Admin-only APIs must verify role permissions
- Environment variables are used instead of hard-coded secrets
- Sensitive data should not be committed into source control

## Assumptions and Scope

This application is built as a complete working platform foundation with a clean responsive UI and backend structure. It is suitable for demonstration, testing, and extension into a more advanced final-year project. The ML fraud prediction logic is implemented with a fallback risk engine and can be connected to a dedicated FastAPI service when needed.

## Future Expansion Recommendations

1. Add a real FastAPI ML service with a trained Paysim model
2. Connect Node.js server to FastAPI for fraud predictions
3. Expand the admin CRUD pages for users and records
4. Add advanced reporting and export features
5. Add account protection, blacklist checks, and audit logs
6. Deploy with Docker and a hosted database

## Summary

This project is a strong foundation for a real-world AI-powered financial fraud detection and risk analytics web application. It includes responsive design, working backend, authentication, admin analytics, and database-backed data flows, while staying scalable for future expansion.
