# ElevateFit

**Modern AI Fitness & Coaching Platform**

[![Live API](https://img.shields.io/badge/API-Live_on_Railway-10B981?style=for-the-badge&logo=railway)](https://fitness-tracking-and-workout-management-system-production.up.railway.app)
[![Frontend](https://img.shields.io/badge/Web-Vercel_Ready-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Stack](https://img.shields.io/badge/Stack-MERN-333333?style=for-the-badge&logo=mongodb)](https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system)
[![AI](https://img.shields.io/badge/AI-Gemini_Powered-4285F4?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Mobile](https://img.shields.io/badge/Mobile-Expo_React_Native-4630EB?style=for-the-badge&logo=expo)](https://expo.dev/)

ElevateFit is a **production-ready fitness SaaS platform** that combines personalized AI coaching, certified trainer booking, workout tracking, nutrition planning, and premium membership management — built for gyms, coaches, and wellness businesses that want a modern client experience.

---

## Why ElevateFit?

| For Your Clients | For Your Business |
|------------------|-------------------|
| AI coach available 24/7 | White-label ready architecture |
| Book certified trainers in-app | Admin dashboard & payment verification |
| Track workouts, weight, steps, BMI | Premium subscription workflow built-in |
| Daily AI-generated training & meal plans | Deploy on Railway + Vercel in minutes |
| Cross-platform (iOS, Android, Web) | Secure JWT auth & MongoDB backend |

---

## Live Demo

| Service | URL |
|---------|-----|
| **Backend API** | https://fitness-tracking-and-workout-management-system-production.up.railway.app |
| **API Health** | `GET /` → `{ status: "online", message: "ElevateFit API is running smoothly" }` |
| **Frontend** | Deploy via Vercel (see [Deployment](#deployment)) |

---

## Platform Features

### Elevate Coach (AI Assistant)
- Personalized workouts with warm-up, exercise tables, cool-down, and coaching cues
- Nutrition guidance with macros, hydration, and meal suggestions
- Context-aware chat with conversation history
- Gemini AI with automatic model failover and circuit breaker

### Trainer Marketplace
- Browse **80+ certified coaches** with HD profiles
- Filter by specialty, rating, availability, and location
- Book online or in-person sessions
- Reviews tied to completed bookings

### Member Experience
- Dashboard with BMI, activity score, and progress analytics
- Workout logger with volume and calorie estimates
- Nutrition tracker and daily AI meal plans
- Weight & step logging with notifications
- Premium membership with manual payment verification

### Admin Console
- User & role management
- Booking approval workflow
- Premium payment verification
- System settings (pricing, support email, maintenance mode)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native, Expo 54, TypeScript, Expo Router |
| **Backend** | Node.js, Express 5, REST API |
| **Database** | MongoDB, Mongoose |
| **AI** | Google Gemini (multi-model failover) |
| **Auth** | JWT, bcrypt, OTP password reset |
| **Deploy** | Railway (API) · Vercel (Web) |

---

## Project Structure

```
ElevateFit/
├── frontend/          # Expo app (iOS · Android · Web)
│   ├── app/           # Screens & navigation
│   ├── components/    # UI components
│   ├── constants/     # Brand.ts, Theme.ts
│   └── services/      # API clients
├── backend/           # Express API
│   ├── controllers/   # Business logic
│   ├── models/        # Mongoose schemas
│   ├── routes/        # REST endpoints
│   └── constants/     # brand.js
├── .agents/           # Elevate Coach AI persona
└── README.md
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system.git
cd Fitness-Tracking-and-Workout-management-system

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
GEMINI_API_KEY=your_gemini_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend** (`frontend/.env`):
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Seed Trainers & Run

```bash
# Terminal 1 — Backend
cd backend
npm run seed:trainers
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

---

## Deployment

### Railway (Backend)
1. Connect GitHub repo → set root to `backend`
2. Add environment variables from `.env.example`
3. Deploy — API live at `*.railway.app`

### Vercel (Frontend Web)
1. Import repo → set root directory to `frontend`
2. Add environment variable:
   ```
   EXPO_PUBLIC_API_URL=https://your-railway-app.up.railway.app/api
   ```
3. Build command: `npm run build` · Output: `dist`

---

## Brand Configuration

Rebrand the entire platform from one place:

| File | Purpose |
|------|---------|
| `frontend/constants/Brand.ts` | App name, AI coach name, support email |
| `backend/constants/brand.js` | API emails, system defaults |

Default brand:
- **App:** ElevateFit
- **AI Coach:** Elevate Coach
- **Support:** support@elevatefit.com

---

## API Overview

| Group | Endpoints |
|-------|-----------|
| Auth | `/api/auth/register`, `/login`, `/forgot-password` |
| Profile | `/api/profile`, `/analytics` |
| Workouts | `/api/workouts`, `/analytics`, `/home-insights` |
| AI Chat | `/api/chat/*` |
| Trainers | `/api/content/trainers`, `/api/bookings` |
| Premium | `/api/premium/purchase`, `/api/premium/my` |
| Admin | `/api/admin/*` |

Full endpoint list available in the repository wiki.

---

## Security

- Password hashing (bcrypt, 10 rounds)
- JWT-protected routes with role-based admin access
- CORS configured for Railway, Vercel, and Expo dev
- Input validation on all controllers
- No secrets committed — `.env` gitignored

---

## Roadmap

- [ ] Stripe / JazzCash automated payments
- [ ] Push notifications (Expo Notifications)
- [ ] Apple HealthKit / Google Fit sync
- [ ] White-label client portals
- [ ] Multi-language support

---

## License

ISC License — see repository for details.

---

## Contact

Built for modern fitness businesses. For demos, customization, or deployment support, open an issue or contact **support@elevatefit.com**.

**Repository:** [Fitness-Tracking-and-Workout-management-system](https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system)
