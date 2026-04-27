# Fitness App - Setup Guide

A complete fitness app with React Native frontend and Express.js backend using MongoDB and JWT authentication.

## Project Structure

```
/project
├── app/                      # React Native Expo Router app
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── workouts.tsx
│   │   ├── diet.tsx
│   │   ├── progress.tsx
│   │   ├── settings.tsx
│   │   └── _layout.tsx
│   ├── index.tsx            # Root redirect
│   └── _layout.tsx          # Root layout with AuthProvider
│
├── context/
│   └── AuthContext.tsx      # Authentication state management
│
├── backend/                 # Express.js backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Meal.js
│   │   └── Workout.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workouts.js
│   │   ├── meals.js
│   │   ├── progress.js
│   │   └── profile.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── constants/
    └── config.ts
```

## Backend Setup

### 1. Configure MongoDB Connection

Edit `backend/.env` and replace `<PASSWORD>` with your actual MongoDB password:

```env
MONGO_URI="mongodb+srv://asfaramir790:<PASSWORD>@fitness012.oogcdqa.mongodb.net/?retryWrites=true&w=majority&appName=fitness012"
JWT_SECRET="fitness_app_secret_key_2025"
PORT=5000
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Start Backend Server

```bash
npm start
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:8081`

## Features

### Authentication
- Sign Up with name, email, and password
- Login with email and password
- JWT-based authentication
- Secure token storage using expo-secure-store
- Automatic session restoration

### Workouts
- View list of default workouts (Push Ups, Squats, Planks, Burpees, Lunges)
- Mark workouts as completed/incomplete
- Persist workout status to database

### Diet
- Add meals for Breakfast, Lunch, and Dinner
- View all meals sorted by date
- Delete meals from your list
- Simple meal name entry

### Progress
- Track current weight
- Save weight to database
- View latest weight entry

### Settings
- Edit profile (name only)
- View email (read-only)
- Logout functionality

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Workouts
- `GET /api/workouts` - Get all workouts
- `PUT /api/workouts/:id/toggle` - Toggle workout completion

### Meals
- `GET /api/meals` - Get all meals
- `POST /api/meals` - Add new meal
- `DELETE /api/meals/:id` - Delete meal

### Progress
- `GET /api/progress` - Get weight
- `PUT /api/progress` - Update weight

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile name

## Testing the App

1. **Sign Up**: Create a new account with email and password
2. **Login**: Use credentials from signup
3. **Workouts**: Click workouts to toggle completion status
4. **Diet**: Add meals for different meal types
5. **Progress**: Enter and save your weight
6. **Settings**: Edit profile name and logout
7. **Re-login**: Verify your data persists

## Important Notes

- Backend must be running on `http://localhost:5000` for the app to work
- MongoDB connection requires internet access
- Tokens are stored securely and automatically restored on app restart
- All data is tied to the authenticated user

## Troubleshooting

**Backend Connection Error**
- Ensure MongoDB connection string is correct
- Verify backend server is running on port 5000
- Check network connectivity

**Authentication Errors**
- Verify email and password are correct
- Check that backend is running
- Clear app cache if issues persist

**TypeScript Errors**
- Run `npm run typecheck` to verify all types
- All dependencies must be properly installed
