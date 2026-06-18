# ShopEZ

[![CI](https://github.com/nikh2951/SHOPEZ/actions/workflows/ci.yml/badge.svg)](https://github.com/nikh2951/SHOPEZ/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

ShopEZ is a modern e‑commerce demo: React + Vite frontend and an Express + Node backend. It includes OTP + JWT auth, Google Sign‑In (demo + optional real verification), a product catalog with add‑to‑cart, and a simulated checkout flow. The backend uses MongoDB with an in‑memory fallback for quick local development.

Key highlights:
- Email OTP registration & verification (falls back to console logging during dev)
- JWT auth for protected endpoints
- Google Sign-In support (requires `GOOGLE_CLIENT_ID` for production)
- Product catalog, product details, and reviews
- Persistent client-side cart (localStorage)
- Simulated checkout that creates orders and updates inventory

## Quick start (local)
Clone and run the app locally (dev):

```powershell
git clone https://github.com/nikh2951/SHOPEZ.git
cd SHOPEZ

# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Then open http://localhost:3000/
```

Backend API:
- API base (dev proxy): `http://localhost:1529/api`
- Health: `http://localhost:1529/api/health`

## Environment variables
Create `backend/.env` with the following as needed:

```
MONGO_URI=mongodb://your-host:27017/shopez   # optional; omit to use in-memory DB
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id      # optional for real Google Sign-In
GMAIL_USER=you@gmail.com                    # optional for sending OTP emails
GMAIL_APP_PASSWORD=your_app_password        # optional
```

Notes:
- Without `MONGO_URI`, the backend starts an ephemeral MongoDB instance for testing via `mongodb-memory-server`.
- If Gmail SMTP vars are not present, OTP codes print to the backend console for developer testing.

## Seed data
On first connection (in-memory DB) the backend seeds sample products and a mock seller account:
- `seller@shopease.com` / `password123`

## Build & production
To build the frontend and serve it from the Express server:

```powershell
cd backend
npm run start:prod
```

This runs the frontend build and serves static files from the backend.

## Files of interest
- Backend: `backend/server.js`, `backend/config/db.js`, `backend/routes/auth.js`, `backend/routes/products.js`, `backend/routes/orders.js`, `backend/models/*`, `backend/utils/sendOTP.js`
- Frontend: `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/pages/*`, `frontend/src/context/*`, `frontend/src/components/*`

## Contributing
Fork, create a branch, and open a pull request. Keep changes focused and include notes.

## License
MIT
