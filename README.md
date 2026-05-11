# 🚀 Fitness Tracker Pro: The Ultimate AI Wellness Ecosystem

<div align="center">
  <img src="https://raw.githubusercontent.com/A4Asfar/Fitness-Tracking-and-Workout-management-system/main/backend/assets/dashboard.png" width="850" alt="Fitness Tracker Pro Dashboard" />
  
  <p align="center">
    <b>Experience the real-time AI wellness ecosystem with a live, functional prototype.</b>
  </p>

  [![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge&logo=rocket)](https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system)
  [![Tech](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)](https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system)
  [![UI](https://img.shields.io/badge/UI-Ultra_Premium-purple?style=for-the-badge&logo=figma)](https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system)
</div>

---

## 📸 Live Prototype Showcase

<div align="center">
  <table border="0">
    <tr>
      <td align="center">
        <img src="https://raw.githubusercontent.com/A4Asfar/Fitness-Tracking-and-Workout-management-system/main/backend/assets/training.png" width="400" /><br/>
        <sub><b>Smart Training Module</b></sub>
      </td>
      <td align="center">
        <img src="https://raw.githubusercontent.com/A4Asfar/Fitness-Tracking-and-Workout-management-system/main/backend/assets/insights.png" width="400" /><br/>
        <sub><b>Data-Driven Insights</b></sub>
      </td>
    </tr>
  </table>
</div>

---

## 💎 The Experience

**Fitness Tracker Pro** isn't just another workout app; it's a high-performance ecosystem designed for elite health management. Built with a "Mobile-First" philosophy and powered by AI, it bridges the gap between digital tracking and professional coaching.

### 🌌 Dark Mode Elegance
Experience a state-of-the-art interface featuring **Glassmorphism**, smooth **60FPS animations**, and a meticulously crafted dark theme that feels premium at every touch.

---

## ⚡ Core Pillars

### 🧠 AI Intelligence Layer
*   **Hyper-Personalized Plans**: Daily workout and nutrition blueprints tailored to your specific biomechanics and goals.
*   **Neural AI Assistant**: A real-time chat expert ready to guide your form, diet, and motivation.
*   **Predictive Analytics**: Intelligent recovery scores and intensity trends calculated from your real performance data.

### 🏋️ Training & Bio-Metrics
*   **Precision Logger**: High-speed entry for sets, reps, and weights with volume tracking.
*   **Interactive Visuals**: Beautiful charts displaying your weekly progress and strength trends.
*   **Health Status Hub**: Integrated BMI analysis and activity scoring to keep you on the peak of your game.
*   **Secure Recovery**: Advanced OTP-based password recovery system with time-limited verification codes.
*   **Neural AI Assistant**: A real-time chat expert ready to guide your form, diet, and motivation.

### 🥗 Culinary Architecture
*   **Macro-Nutrition Focus**: Precise tracking of protein, fats, and carbs for every meal.
*   **Goal-Aligned Recipes**: Specialized recommendations for cutting, bulking, or maintaining.

---

## 🛠️ Technical Architecture

<table align="center">
  <tr>
    <td align="center"><b>Frontend</b></td>
    <td align="center"><b>Backend</b></td>
    <td align="center"><b>Database / Cloud</b></td>
  </tr>
  <tr>
    <td>React Native (Expo)<br/>TypeScript<br/>Reanimated 3<br/>Lucide Icons</td>
    <td>Node.js<br/>Express Framework<br/>Nodemailer (OTP)<br/>JWT & Bcrypt</td>
    <td>MongoDB Atlas<br/>Railway Deployment<br/>Persistent Storage<br/>Real-time Cloud Sync</td>
  </tr>
</table>

---

## 🚀 Deployment & Production Setup

### 📦 Prerequisites
*   Node.js (LTS Version)
*   Expo Go (for mobile preview)
*   MongoDB Atlas cluster
*   Gmail account (for OTP service)

### 🛠️ Environment Variables (.env)

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | Your MongoDB Atlas Connection String |
| `JWT_SECRET` | Secure key for token generation |
| `EMAIL_USER` | Your Gmail address (for OTP sender) |
| `EMAIL_PASS` | Gmail **App Password** (16 characters) |
| `EXPO_PUBLIC_API_URL` | Your Railway Production URL |

### 🏁 Getting Started

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/A4Asfar/Fitness-Tracking-and-Workout-management-system.git
    cd Fitness-Tracking-and-Workout-management-system
    ```

2.  **Launch Production Server**
    ```bash
    cd backend
    npm install
    npm start
    ```

3.  **Launch Mobile Interface**
    ```bash
    cd frontend
    npm install
    npx expo start
    ```

---

## 📂 Project Blueprint

```bash
├── 📱 frontend/         # React Native (Expo) Application
│   ├── 🛠️ components/   # Atomic UI System
│   ├── 🗺️ app/          # Navigation & Screen Logic
│   └── 🔌 services/     # API Integration Layer
├── ⚙️ backend/          # Node.js Express API
│   ├── 📑 models/       # Mongoose Schemas
│   ├── 🚀 routes/       # API Controllers
│   └── 🛡️ middleware/   # Security & Logic
└── 📜 README.md         # Documentation
```

---

<div align="center">
  <p><b>Developed with ❤️ for the Modern Athlete.</b></p>
  <img src="https://img.shields.io/badge/License-ISC-green?style=flat-square" alt="License" />
</div>
