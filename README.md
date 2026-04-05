# 💸 Finance Dashboard

A full-stack personal finance management application that allows users to track income and expenses through categories and transactions, with JWT-based authentication and a RESTful API.

---

## 🚀 Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 8** — build tool and dev server
- **Tailwind CSS 3** — utility-first styling
- **React Router DOM 7** — client-side routing
- **Context API** — global auth state management

### Backend
- **Node.js** + **Express 5**
- **TypeScript** + **tsx** (hot reload)
- **Prisma 7** — ORM with PostgreSQL adapter
- **PostgreSQL** — relational database
- **JWT (jsonwebtoken)** — stateless authentication
- **bcrypt** — password hashing
- **CORS** — cross-origin resource sharing

---

## 📁 Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── context/        # AuthContext (global auth state)
│   │   ├── services/       # API service layer (auth, categories, transactions)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── backend/
    ├── src/
    │   ├── controllers/    # Business logic (auth, categories, transactions)
    │   ├── middlewares/    # JWT auth middleware
    │   ├── routes/         # Express routers
    │   ├── prisma.ts       # Prisma client setup
    │   ├── app.ts          # Express app config
    │   └── server.ts       # Entry point
    └── prisma/
        ├── schema.prisma   # DB models
        └── migrations/     # SQL migrations
```

---

## 🗄️ Database Schema

```
User
 ├── id (uuid)
 ├── name
 ├── email (unique)
 ├── password (hashed)
 ├── createdAt
 ├── categories[]
 └── transactions[]

Category
 ├── id (uuid)
 ├── name
 ├── type  (INCOME | EXPENSE)
 ├── userId (FK → User)
 └── transactions[]

Transaction
 ├── id (uuid)
 ├── amount (float)
 ├── description
 ├── date
 ├── userId (FK → User)
 └── categoryId (FK → Category)
```

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create new user | ❌ |
| POST | `/login` | Login and receive JWT | ❌ |

### Categories — `/api/categories`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all user categories | ✅ |
| POST | `/` | Create a new category | ✅ |

### Transactions — `/api/transactions`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all user transactions | ✅ |
| POST | `/` | Create a new transaction | ✅ |
| DELETE | `/:id` | Delete a transaction | ✅ |

> ✅ = Requires `Authorization: Bearer <token>` header

---

## ⚙️ Getting Started

### Prerequisites
- Node.js >= 20
- PostgreSQL database (local or cloud)

### 1. Clone the repository
```bash
git clone <repo-url>
cd finance-dashboard
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
JWT_SECRET="your-super-secret-key"
PORT=5000
```

Run migrations and start the dev server:
```bash
npx prisma migrate dev
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to `http://localhost:5000`.

---

## 🔐 Authentication Flow

1. User registers or logs in via `/api/auth`
2. Server returns a signed JWT token
3. Frontend stores the token in `localStorage`
4. All protected requests include `Authorization: Bearer <token>`
5. `verifyToken` middleware validates the JWT on each protected route
6. Decoded user data (`userId`, `email`) is attached to `req.user`

---

## 🧩 Key Design Decisions

- **Prisma with pg adapter** — uses a native PostgreSQL connection pool (`pg.Pool`) for better performance and compatibility
- **Express 5** — async error handling improvements over v4
- **Context API over Redux** — lightweight auth state without extra dependencies
- **Service layer on frontend** — all API calls are abstracted into typed service modules (`auth.service.ts`, `transaction.service.ts`, `category.service.ts`), keeping components clean

---

## 📦 Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## 📄 License

MIT
