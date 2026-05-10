# Fitness Tracker Pro: AI-Powered Workout & Wellness Ecosystem

![Project Logo](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![UI Design](https://img.shields.io/badge/UI-Premium-purple?style=for-the-badge)

Fitness Tracker Pro is a comprehensive, full-stack mobile application designed to revolutionize personal health management. Combining high-end UI design with advanced AI-driven features, it provides a seamless experience for tracking workouts, managing nutrition, and receiving professional fitness guidance.

---

## 🌟 Key Features

### 🤖 AI-Powered Intelligence
- **Personalized Daily Plans**: Dynamic generation of workout and nutrition plans based on user profiles.
- **AI Fitness Chat**: Real-time AI assistant to answer fitness queries and provide motivation.
- **Progress Insights**: Advanced data visualization of weight trends and workout performance.

### 🏋️ Workout & Activity Tracking
- **Smart Logger**: Effortlessly log exercises, sets, and reps with a premium interface.
- **Workout Library**: Access a curated list of exercises with detailed instructions.
- **Weight Tracking**: Monitor weight changes over time with interactive charts.

### 🥗 Nutrition & Meal Management
- **Meal Logging**: Track daily caloric intake and macro-nutritional data.
- **Professional Recommendations**: Specialized meal plans tailored to fitness goals (Muscle Gain, Fat Loss, etc.).

### 🤝 Professional Guidance
- **Trainer Consultations**: Book and manage sessions with certified fitness trainers.
- **Trainer Profiles**: Explore detailed trainer bios, specialties, and success stories.

### 📱 Premium User Experience
- **Dark Mode Aesthetics**: Sleek, modern design with glassmorphism and smooth animations.
- **Custom Notifications**: Real-time reminders for workouts, meals, and consultations.
- **Robust Authentication**: Secure JWT-based login, signup, and profile management.

---

## 🛠️ Tech Stack

**Frontend:**
- React Native (Expo)
- TypeScript
- Expo Router (File-based navigation)
- React Native Reanimated (Smooth UI transitions)
- Lucide Icons & Expo Vector Icons

**Backend:**
- Node.js & Express
- MongoDB (Mongoose ODM)
- JWT (JSON Web Tokens) for security
- Bcrypt.js for password hashing

---

## 📁 Project Structure

```text
├── frontend/             # React Native (Expo) Application
│   ├── app/              # Screen components and routing
│   ├── components/       # Reusable UI components
│   ├── services/         # API integration layers
│   ├── constants/        # Theme tokens and static data
│   └── utils/            # Helper functions
├── backend/              # Node.js Express Server
│   ├── models/           # MongoDB Schemas
│   ├── routes/           # API Endpoints
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth and Error handlers
│   └── config/           # Database configuration
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app (for mobile testing)
- MongoDB Atlas Account

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and set the API URL:
   ```env
   EXPO_PUBLIC_API_URL=http://your-local-ip:5000/api
   ```
4. Start the application:
   ```bash
   npm run dev
   ```

---

## 🛡️ License

This project is licensed under the ISC License.

---

## 👨‍💻 Developed By
Developed with ❤️ for the fitness community.
