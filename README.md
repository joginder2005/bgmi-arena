# BGMI Arena

Full-stack BGMI tournament platform with a Vite + React + Tailwind frontend and a Node.js + Express + MongoDB backend.

## Folder structure

```text
build-a-pixel-perfect-frontend-ui/
  frontend/
    public/
    src/
      components/
      data/
      pages/
      App.jsx
      index.css
      main.jsx
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    .env.example
    package.json
    server.js
  README.md
```

## Frontend setup

1. Open a terminal in `frontend`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local Vite URL, usually `http://localhost:5173`.

## Backend setup

1. Open a terminal in `backend`.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Fill in MongoDB and Razorpay test credentials.
5. Start MongoDB locally or provide a hosted MongoDB URI.
6. Run `npm run dev`.
7. Backend starts on `http://localhost:5000`.

## Environment files

Frontend example:

```env
VITE_API_URL=http://localhost:5000
```

Backend example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_yourkey
RAZORPAY_KEY_SECRET=your_secret
CLIENT_URL=http://localhost:5173
ADMIN_REGISTRATION_KEY=your_admin_key
```

For production, set `CLIENT_URL` to your deployed frontend URL. You can also provide multiple frontend URLs by separating them with commas.

## Deployment

Recommended setup:

1. Deploy `frontend` to Vercel.
2. Deploy `backend` to Render.
3. Use MongoDB Atlas for the production database.

### Frontend on Vercel

1. Import the repo in Vercel.
2. Set the project root to `frontend`.
3. Add env var `VITE_API_URL` with your backend URL, for example `https://bgmi-arena-backend.onrender.com`.
4. Deploy.

The included [frontend/vercel.json](frontend/vercel.json) adds SPA rewrites so routes like `/matches` and `/login` work directly.

### Backend on Render

1. Import the repo in Render or use the included [render.yaml](render.yaml).
2. Set env vars:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` to your Vercel frontend URL
   - `ADMIN_REGISTRATION_KEY`
   - optional Razorpay keys
3. Deploy.

Health check endpoint:

```text
GET /health
```

## API overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

Sample register payload:

```json
{
  "username": "playerone",
  "email": "playerone@example.com",
  "password": "secret123",
  "bgmiId": "BGMI778899"
}
```

### Matches

- `POST /api/matches` admin only
- `GET /api/matches`
- `POST /api/matches/:matchId/join`
- `PUT /api/matches/:matchId` admin only
- `DELETE /api/matches/:matchId` admin only
- `PUT /api/matches/:matchId/room` admin only
- `GET /api/matches/:matchId/room` joined players only
- `POST /api/matches/:matchId/payout` admin only

Sample create match payload:

```json
{
  "title": "Warehouse Finals",
  "type": "tdm",
  "mode": "4v4",
  "map": "Warehouse",
  "entryFee": 99,
  "prizePool": 4000,
  "totalSlots": 8,
  "status": "upcoming"
}
```

Sample payout payload:

```json
{
  "winners": [
    {
      "userId": "USER_OBJECT_ID",
      "amount": 2500,
      "killsAwarded": 18
    },
    {
      "userId": "USER_OBJECT_ID",
      "amount": 1500,
      "killsAwarded": 12
    }
  ]
}
```

### Wallet

- `POST /api/wallet/deposit/order`
- `POST /api/wallet/deposit/verify`
- `GET /api/wallet/balance`
- `GET /api/wallet/transactions`

Sample deposit payload:

```json
{
  "amount": 500
}
```

### Withdrawals

- `POST /api/withdrawals`
- `GET /api/withdrawals`
- `PATCH /api/withdrawals/:withdrawalId` admin only

### Leaderboard and Admin

- `GET /api/leaderboard?sortBy=earnings`
- `GET /api/admin/dashboard` admin only

## Notes

- Authentication uses JWT bearer tokens.
- Passwords are hashed with bcrypt.
- Wallet deposits use Razorpay order creation and signature verification in test mode.
- Match joining deducts entry fee and stores a transaction.
- Completed matches are locked from edit or delete actions.
- Room credentials are only visible to players who joined the match.
