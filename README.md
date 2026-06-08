# Steakz MIS – Backend

Node.js + Express + TypeScript + Prisma + PostgreSQL backend for the Steakz Management Information System.

## Roles
- `ADMIN` – Full system access
- `HQ_MANAGER` – All-branch oversight
- `BRANCH_MANAGER` / `MANAGER` – Single branch management
- `CHEF` – Kitchen order management
- `CASHIER` – Order taking and payments
- `CUSTOMER` – Public access

## Setup
```bash
npm install
npx prisma migrate dev
npm run dev
```

## Environment Variables
Create a `.env` file:
```
DATABASE_URL=postgresql://user:password@host:5432/steakzdb
JWT_SECRET=your-secret-key
```

## API Base URL
`http://localhost:3000`

### Auth
- `POST /auth/login` – Login, returns JWT token
- `POST /auth/signup` – Register new user

### Users (Admin only)
- `GET /api/users` – List all users
- `POST /api/users` – Create user
- `PUT /api/users/:id` – Update user
- `DELETE /api/users/:id` – Delete user
- `PATCH /api/users/:id/role` – Change role

## Frontend
See: https://github.com/sderrick21/steakz-mis-frontend
