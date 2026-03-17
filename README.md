# 🚀 Command Center v2.0 — Smart Collaborative Project Manager

[![Velo Design](https://img.shields.io/badge/Design-Velo%20Premium-indigo)](https://github.com/owsam22/project-management-tool)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20+%20Next.js-blue)](https://github.com/owsam22/project-management-tool)
[![Author](https://img.shields.io/badge/Author-owsam22-purple)](https://github.com/owsam22)

**Command Center v2.0** is a high-fidelity, real-time project management platform designed for teams that demand visual elegance and operational intelligence. Built with a "Velo" premium design language, it transforms project coordination into a seamless, high-performance experience.

---

## 🌐 Live Deployment

| Component | Status | Link |
| :--- | :--- | :--- |
| **Frontend** | 🚀 Live | [View Dashboard](https://project-management-tool-two-theta.vercel.app/) |
| **Backend API** | 📡 Synchronized | [View API Node](https://project-management-tool-backend-zwkv.onrender.com/) |

---

## ✨ Key Features

### 🛠 Intelligence Hub (Dashboard)
- **Personalized Analytics**: Real-time stats for active projects and team missions.
- **High-Fidelity Project Cards**: Premium glassmorphism effects with dynamic hover states.
- **Liquid Responsiveness**: Optimized for mobile, tablet, and desktop viewports.

### 📡 Protocol Synchronization (Real-Time)
- **Socket.io Integration**: Get instant updates on task movements and team activity.
- **Actionable Notifications**: Accept or decline project invites directly from the activity hub.
- **Centered Activity Hub**: A refined, mobile-optimized dropdown system for professional tracking.

### 🛡 Enterprise-Grade Security
- **JWT Authentication**: Secure stateless authentication for all protocols.
- **Role-Based Access**: Specialized controls for Owners, Admins, and Members.
- **Encrypted Communication**: All data transfers are secured via industry-standard encryption.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15+, React 19, Tailwind CSS 4, Lucide React, Zustand, TanStack Query.
- **Backend**: Node.js, Express 5, Socket.io, Mongoose (MongoDB).
- **Design**: Vanilla CSS with custom glassmorphism tokens and "Velo" v2.0 principles.

---

## 🛠 Installation & Local Deployment

### 1. Clone the Nodes
```bash
git clone https://github.com/owsam22/project-management-tool.git
cd project-management-tool
```

### 2. Configure Environment
Create `.env` files in both `frontend` and `backend` directories.

**Backend (.env):**
```env
PORT=5000
DATABASE_URL=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

**Frontend (.env):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Initialize Protocols
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Author
**Developed with ❤️ by [owsam22](https://github.com/owsam22)**

Join the mission and contribute to the future of collaborative intelligence!
