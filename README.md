# 🚀 Fitness Tracker Pro

[![Live Status](https://img.shields.io/badge/Status-Live_Production-CCFF00?style=for-the-badge&logo=rocket&logoColor=black)](https://fitness-tracking-and-workout-management-system-production.up.railway.app)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-333333?style=for-the-badge&logo=mongodb)](https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system)
[![Gemini AI Powered](https://img.shields.io/badge/AI-Gemini_Powered-blue?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Expo Native App](https://img.shields.io/badge/UI-Expo_React_Native-purple?style=for-the-badge&logo=expo)](https://expo.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-007ACC?style=flat-square)](https://opensource.org/licenses/ISC)

Fitness Tracker Pro is a premium MERN-stack wellness ecosystem featuring a **React Native/Expo frontend** and a robust **Node/Express/MongoDB backend** powered by **Gemini AI**. It delivers dynamic workout schedules, nutrition guidelines, macro recommendations, and trainer consulting, complete with an advanced, centralized AI failover engine.

---

## 🔗 Demo Links

*   **Live App**: `https://fitness-tracking-and-workout-management-system-production.up.railway.app` (Backend API root)
*   **Frontend Client URL**: `Not Yet Publicly Deployed` (Runs locally via Expo Go)
*   **API Documentation**: `Refer to the API Endpoints section in this README`

---

## 📸 Screenshots

### Login Screen
*Placeholder for Login / Sign Up UI*

### Dashboard
*Placeholder for Dashboard UI showing BMI, weekly stats, and daily steps*

### AI Chat
*Placeholder for FitAI Coach chat UI with active responses*

### Workout Planner
*Placeholder for Dynamic workout logs and history*

### Daily Nutrition Plan
*Placeholder for Meal selections and macro details*

### Profile Screen
*Placeholder for Profile settings and premium membership details*

---

## ✨ Features

### 🧠 AI Features (FitAI Coach)
*   **Centralized AI System**: One cohesive, system-instruction-enforced prompt for the entire application.
*   **Personalized Workouts & Nutrition**: Dynamically generates full workouts (Warm-up, Table of 6–10 exercises with coaching cues, Cool-down, summaries) and macro guidelines tailored to user goals and weight.
*   **Context-Aware Chat Memory**: Keeps the last 10 messages of conversation history in context for cohesive follow-ups.
*   **Dynamic Model Discovery**: Queries the Gemini API at startup to determine all globally available model candidates.
*   **Self-Healing Failover**: Sequentially switches models in real-time (`gemini-2.5-flash` $\rightarrow$ `gemini-2.0-flash` $\rightarrow$ `gemini-2.0-flash-lite` $\rightarrow$ `gemini-flash-latest`) if transient failures occur.
*   **Circuit Breaker & Recovery**: Automatically trips `OPEN` for 60 seconds if all models fail to prevent API exhaustion, returning graceful fallbacks. Checks connectivity using a 5s health query when transitioning to `HALF-OPEN`.
*   **Timeout Protection**: Restricts API calls to 20 seconds using `AbortController` to prevent backend hang-ups.
*   **Detailed Analytics Logging**: Logs request duration, model used, retry attempts, circuit status, and filters keys for privacy.

### 🔐 Authentication & Security
*   **JWT Authentication**: Secure stateless token-based authorization.
*   **Password Hashing**: Secure storage via `bcryptjs` (rounds = 10).
*   **Forgot Password/OTP Flow**: E-mail validation using custom OTP codes with expiry validation via `nodemailer`.
*   **Protected Routes**: Authorization middleware blockades profile, steps, workouts, weight logging, and consultation pages from unauthorized requests.

### 👤 User Capabilities
*   **Dashboard Insights**: Central hub showing total workouts logged, total volume lifted, calculated calorie burn estimates, BMI categories, and weekly activity scores.
*   **Workout Logger**: Full CRUD tracking for individual exercises, sets, reps, weight, duration, and dates.
*   **Culinary Tracker**: Custom logging for macro-nutrients (protein, carbs, fat, calories) and built-in meals.
*   **Trainer Consultations**: Directly schedule consultations with certified coaches.
*   **Weight & Step Loggers**: Input fields and graphs tracking daily steps and body weight logs.
*   **Notifications**: Automated in-app notifications and read statuses.

### 💻 Backend Infrastructure
*   **Express Router**: Strictly organized routing tables.
*   **Mongoose Validation**: Robust data-integrity models using Mongoose constraints and virtuals.
*   **Global Error Handling**: Standardized catch-alls that log server errors and return clean JSON to the client.

---

## 🛠️ Tech Stack

*   **Frontend**: React Native, Expo, TypeScript, Expo Router (file-based routing)
*   **Backend**: Node.js, Express.js (REST APIs)
*   **Database**: MongoDB, Mongoose ODM
*   **AI Engine**: Google Gemini AI (Official `@google/generative-ai` SDK)
*   **Security & Auth**: JSON Web Tokens (JWT), bcryptjs, validator
*   **SMTP Service**: Nodemailer (OTP E-mail Delivery)
*   **Deployment**: Railway (Backend & database), Expo Application Services (EAS for Mobile compilation)

---

## 📐 Architecture Flow

```mermaid
graph TD
    Client[React Native / Expo Client App] -->|HTTPS REST Request / Bearer Token| API[Express Router / backend/server.js]
    API -->|Route Protection / JWT| MW[authMiddleware.js]
    MW -->|Authorized payload| Ctrl[Controllers e.g., chatController.js]
    Ctrl -->|Fetch profile / logs| DB[(MongoDB / Mongoose Models)]
    Ctrl -->|Context Messages & User Profile| Helper[geminiHelper.js]
    Helper -->|Google Generative AI SDK| Gemini[Google Gemini API]
    Gemini -->|AI Response with Prefix| Helper
    Helper -->|Parsed & Sanitized JSON| Ctrl
    Ctrl -->|HTTP JSON Response| Client
```

---

## 📂 Folder Structure

```
Fitness-Tracking-and-Workout-management-system/
├── .agents/
│   └── AGENTS.md                  # Central FitAI persona rules
├── backend/
│   ├── assets/                    # Dashboard and marketing images
│   ├── config/
│   │   └── db.js                  # MongoDB connection setup
│   ├── controllers/
│   │   ├── adminController.js     # Admin metrics
│   │   ├── authController.js      # Register, login, forgot password
│   │   ├── chatController.js      # Personal profile-injected AI Chat
│   │   ├── consultationController.js
│   │   ├── contentController.js   # Dynamic plans and suggestions
│   │   ├── mealController.js
│   │   ├── notificationController.js
│   │   ├── profileController.js   # Profile details & dashboard stats
│   │   ├── stepController.js
│   │   ├── weightController.js
│   │   └── workoutController.js   # CRUD loggers
│   ├── middleware/
│   │   ├── auth.js                # JWT verifying middleware
│   │   └── errorMiddleware.js     # Global catches
│   ├── models/
│   │   ├── Chat.js
│   │   ├── DailyPlan.js
│   │   ├── Meal.js
│   │   ├── MealSelection.js
│   │   ├── Notification.js
│   │   ├── Step.js
│   │   ├── Trainer.js
│   │   ├── TrainerConsult.js
│   │   ├── User.js
│   │   ├── Weight.js
│   │   ├── Workout.js
│   │   └── WorkoutSuggestion.js
│   ├── routes/                    # API route definitions
│   ├── utils/
│   │   └── geminiHelper.js        # Central AI integration engine
│   ├── .env                       # Backend local environment configuration
│   ├── server.js                  # App bootloader & middleware setups
│   └── package.json
├── frontend/
│   ├── app/                       # Expo Router application screens
│   ├── components/                # Custom React Native UI components
│   ├── constants/                 # Styling colors & layout standards
│   ├── context/                   # Global React contexts (Auth context)
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # Client API request layer
│   ├── utils/                     # Formatters
│   ├── tsconfig.json              # TypeScript setup
│   └── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Ecosystem
```bash
git clone https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system.git
cd Fitness-Tracking-and-Workout-management-system
```

### 2. Configure Backend
```bash
cd backend
npm install
```
*   Create a `.env` file inside `backend/` using the template below.

### 3. Configure Frontend
```bash
cd ../frontend
npm install
```
*   Create a `.env` file inside `frontend/` using the template below.

---

## 🔑 Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| `PORT` | Local server port | `5000` |
| `MONGO_URI` | MongoDB Connection URL | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for token signing | `your_jwt_signature_secret_phrase` |
| `GEMINI_API_KEY` | Google Gemini API Access Key | `AIzaSy...` |
| `EMAIL_USER` | Email address for OTP delivery | `example@gmail.com` |
| `EMAIL_PASS` | App password for mail sender | `xxxx xxxx xxxx xxxx` |

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Base URL of the backend API | `http://192.168.x.x:5000/api` |

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new athlete | ❌ |
| `POST` | `/api/auth/login` | Authenticate and get JWT | ❌ |
| `POST` | `/api/auth/forgot-password` | Send OTP reset code to email | ❌ |
| `POST` | `/api/auth/verify-reset-code` | Validate email OTP reset code | ❌ |
| `POST` | `/api/auth/reset-password` | Set a new account password | ❌ |
| `GET` | `/api/auth/me` | Fetch active user credentials | 👤 Yes |

### AI Engine (FitAI Coach)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/chat/ai` | Send message to AI coach | 👤 Yes |
| `GET` | `/api/chat/ai/conversations` | Get user's conversation threads | 👤 Yes |
| `POST` | `/api/chat/ai/new` | Instantiate empty AI chat | 👤 Yes |
| `GET` | `/api/chat/ai/:chatId` | Get message history of a chat thread | 👤 Yes |
| `PUT` | `/api/chat/ai/:chatId/rename` | Rename a conversation thread | 👤 Yes |
| `DELETE` | `/api/chat/ai/:chatId` | Terminate/delete a thread | 👤 Yes |

### Fitness Content & Blueprints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/content/daily-plan` | Retrieve dynamic Daily Workout & Diet Plan | 👤 Yes |
| `GET` | `/api/content/trainers` | List all available certified coaches | 👤 Yes |
| `GET` | `/api/content/trainers/:id` | Get details for specific trainer | 👤 Yes |
| `GET` | `/api/content/nutrition-suggestions` | Get meal suggestions based on goals | 👤 Yes |
| `GET` | `/api/content/meal` | Get micro/macro details of a meal by name | 👤 Yes |
| `GET` | `/api/content/workout-suggestions` | Get pre-packaged workout suggestions | 👤 Yes |

### Workout Logs

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/workouts` | Retrieve logged workouts history | 👤 Yes |
| `POST` | `/api/workouts` | Create/Log a new workout | 👤 Yes |
| `GET` | `/api/workouts/stats` | Retrieve volume and count statistics | 👤 Yes |
| `GET` | `/api/workouts/analytics` | Get weekly/monthly trends data | 👤 Yes |
| `GET` | `/api/workouts/home-insights` | Get home screen analytics summary | 👤 Yes |
| `GET` | `/api/workouts/:id` | Get detailed stats for specific log | 👤 Yes |
| `PUT` | `/api/workouts/:id` | Update sets, reps, or notes for a log | 👤 Yes |
| `DELETE` | `/api/workouts/:id` | Delete logged workout | 👤 Yes |

### Meals & Nutrition Logs

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/meals` | Retrieve logged meals history | 👤 Yes |
| `POST` | `/api/meals` | Log a custom meal selection | 👤 Yes |
| `GET` | `/api/meals/recommendations` | Get macro-optimized suggestions | 👤 Yes |
| `GET` | `/api/meals/meal-by-name` | Look up macro stats for single food | 👤 Yes |
| `DELETE` | `/api/meals/:id` | Delete logged meal entry | 👤 Yes |

### Profile & Logs

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/profile` | Retrieve active user's settings | 👤 Yes |
| `PUT` | `/api/profile` | Update user measurements, height, weight, goal | 👤 Yes |
| `PUT` | `/api/profile/upgrade` | Upgrade membership status to premium | 👤 Yes |
| `GET` | `/api/profile/analytics` | Get calculated dashboard stats (BMI, Activity) | 👤 Yes |
| `GET` | `/api/weight` | Get weight tracking history logs | 👤 Yes |
| `POST` | `/api/weight` | Log current weight measurement | 👤 Yes |
| `GET` | `/api/steps` | Get step counter tracking history | 👤 Yes |
| `POST` | `/api/steps` | Log today's step count | 👤 Yes |
| `GET` | `/api/consultations` | Get consultations logs | 👤 Yes |
| `POST` | `/api/consultations` | Schedule consultation with trainer | 👤 Yes |
| `GET` | `/api/admin/stats` | Get admin analytics insights | 👑 Admin Only |

---

## 🚀 Running Locally

### Backend
```bash
cd backend
npm run dev
```
*   Server listens on `http://localhost:5000`.

### Frontend
```bash
cd frontend
npx expo start
```
*   Scan QR code using the Expo Go App (iOS/Android) or press `w` to launch Expo Web.

---

## 🔒 Security & Performance

### Security Mechanisms
*   **Password Cryptography**: Passwords undergo salted hashing via `bcryptjs` before storage.
*   **Stateless Protection**: Routes require token-verifying middleware that rejects invalid JWT signatures.
*   **Sanitization & Validation**: Inbound payloads are validated for email formats and input types.
*   **Error Masking**: API call boundaries strip away keys, tokens, and system variables to prevent log leakage.
*   **Rate Limiting**: *Not Yet Implemented*.

### Performance Optimization
*   **Dynamic Failover**: Retries and swaps models instantly to ensure service uptime.
*   **Circuit Breakers**: Fast-rejects incoming requests during outages, saving processing cycles.
*   **Abort Signals**: Kills hanging API queries exactly after 20 seconds.
*   **Index-Optimized Database**: Fetching is optimized by tying logs directly to indexed Mongo user references.
*   **Caching**: *Not Yet Implemented*.

---

## 🗺️ Roadmap & Future Improvements

- [ ] **Exercise Tracking**: Direct wearable/health API (Apple HealthKit / Google Fit) integrations.
- [ ] **Food Image Recognition**: Input meal logging directly via photo processing.
- [ ] **Push Notifications**: Expo push notifications for workout reminders and goal achievements.
- [ ] **Wearable Integration**: Sync heart rate and caloric metrics directly from smartwatches.
- [ ] **Admin Dashboard**: Full portal to manage coaches, consults, and overall system analytics.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

---

## 👤 Author

*   **GitHub**: [@A4Asfar](https://github.com/A4Asfar)
*   **Project Link**: [Fitness-Tracking-and-Workout-management-system](https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system)
