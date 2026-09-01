# Smart Split 💸

Smart Split is a full-stack group expense splitting app built to make sharing costs between friends, roommates, or travel groups as painless as possible. You add expenses, it figures out who owes who — and keeps everyone in the loop with email notifications.

---

## What it does

- Create groups and invite members by email
- Add expenses with automatic equal splitting
- Upload a receipt photo and let AI read the items and total for you
- Add expenses in any currency — the app converts everything to the group''s base currency automatically
- Mark expenses as recurring (daily, weekly, or monthly) and they get added automatically in the background
- See a clean balance breakdown that shows the minimum number of payments needed to settle up
- Delete expenses you added by mistake
- Get an email notification whenever a new expense is added to your group

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication, bcrypt for password hashing
- Multer for file uploads
- Cloudinary for image storage
- Gemini Vision API for receipt OCR
- node-cron for recurring expense scheduling
- Nodemailer for email notifications
- open.er-api.com for live currency conversion

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB database (local or MongoDB Atlas)
- A Cloudinary account (free tier works)
- A Google Cloud project with Gemini API access
- A Gmail account with an App Password for Nodemailer

### Clone the repo

```bash
git clone https://github.com/KartikManuja/smart-split.git
cd smart-split
```

### Set up the server

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Start the server:

```bash
npm run dev
```

### Set up the client

```bash
cd client
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Get all groups for the logged-in user |
| POST | `/api/groups` | Create a new group |
| GET | `/api/groups/:groupId` | Get a single group |
| POST | `/api/groups/:groupId/members` | Add a member by email |
| GET | `/api/groups/:groupId/balances` | Get balance breakdown for a group |
| GET | `/api/groups/:groupId/settle-up` | Get optimized settlement transactions |
| POST | `/api/groups/:groupId/settlements` | Record a settlement payment |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Add a new expense |
| GET | `/api/expenses/:groupId` | Get all expenses in a group |
| DELETE | `/api/expenses/:id` | Delete an expense |
| POST | `/api/expenses/test-upload` | Upload a receipt image to Cloudinary |
| POST | `/api/expenses/test-receipt` | Run Gemini OCR on a receipt image URL |

---

## How the debt algorithm works

Instead of showing raw pairwise debts ("A owes B, B owes C, C owes A"), Smart Split runs a simplification algorithm on the group balances. It figures out the minimum number of transactions that would clear everyone''s balance, so no one makes more payments than they need to.

---

## Recurring expenses

When you mark an expense as recurring, the app stores a `nextRecurrenceDate` on it. A cron job runs every night at midnight, finds all recurring expenses that are due, creates a fresh copy of each one, and pushes the next due date forward. The old copy stays as a normal historical expense.

---

## Currency conversion

Each group has a base currency (default: USD). When you add an expense in a different currency, the backend fetches the live exchange rate from `open.er-api.com`, converts the amount, and saves both the original and converted values. All balance calculations always use the base currency, so the math stays clean.

---

## Deployment

- **Backend**: Render (set all environment variables in the Render dashboard under Environment)
- **Frontend**: Vercel (set `VITE_API_URL` if needed, or update the axios base URL before deploying)

---

## License

MIT
