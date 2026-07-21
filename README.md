# IntervueX - Real-Time Collaborative Interview Platform 🚀

IntervueX is a FAANG-level, full-stack web application designed to conduct live, collaborative technical interviews. It provides a secure, role-based environment with real-time code synchronization, isolated multi-language code execution, native WebRTC video/audio communication, and AI-driven automated evaluation.

---

## ✨ Core Features

- **👨‍💻 Collaborative Code Editor:** Real-time synchronization of code, language selection, and cursor movements using **Monaco Editor** and **Socket.io**.
- **🎥 WebRTC Video & Audio:** Built-in 1-on-1 native video calling using `RTCPeerConnection` for seamless, zero-latency communication without third-party plugins.
- **⚡ Isolated Code Execution Engine:** Safely compiles and executes untrusted code in **Node.js, Python 3, C++, and Java** using strict child processes with timeout constraints. Evaluates against hidden and visible test cases.
- **🔐 Role-Based Access Control (RBAC):** Distinct experiences for **Interviewers** (dashboard, analytics, AI grading) and **Candidates** (distraction-free workspace, timer, instant join).
- **📡 Real-Time Notifications:** Dynamic, database-backed notifications pushed instantly to candidates when they are assigned new interviews.
- **📊 AI Automated Evaluation:** Integrates Google's **Gemini AI** to automatically evaluate submitted code for Time/Space Complexity, readability, edge-case handling, and overall performance.
- **⏪ Session Replay (Event Sourcing):** Records every keystroke, output, and chat message to MongoDB, allowing interviewers to accurately replay the entire interview sequence post-session.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite)
- **Tailwind CSS 4** (Styling)
- **Zustand** (State Management)
- **React Router DOM** (Routing)
- **Monaco Editor** (IDE features)
- **Socket.io-client** (WebSockets)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database)
- **Socket.io** (Signaling & Real-time Sync)
- **JWT & bcryptjs** (Authentication & Security)
- **Google Generative AI SDK** (Gemini LLM)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- GCC/G++, Python3, and Java installed locally (for the execution engine).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akshaya719/interveuX.git
   cd interveuX
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `/backend` directory:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *Optional: Run the database seeder to load 10 FAANG-level questions:*
   ```bash
   node seed.js
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🏗️ Architecture Highlights

### Code Execution Sandbox
When a user clicks "Run Code", the payload hits the `/api/execute` endpoint. The controller generates temporary files on the local disk, spawns a child process (`execFile`) with strict timeouts (e.g., 5 seconds max), and captures `stdout` and `stderr`. It evaluates the logic against expected test case outputs before cleaning up the file system.

### WebRTC Signaling over Socket.io
To avoid heavy WebRTC SDKs, IntervueX uses native `RTCPeerConnection`. The `Socket.io` server acts as a signaling layer, silently transferring `webrtc-offer`, `webrtc-answer`, and `webrtc-ice-candidate` packets between the Interviewer and Candidate to establish a secure peer-to-peer video connection.

### Event Sourcing for Replays
Instead of only saving the final code submission, every action (typing, changing languages, receiving terminal output) is fired as a socket event and simultaneously stored in MongoDB as a `SessionEvent` with a timestamp. The Replay engine simply plays back these events sequentially to recreate the interview exactly as it happened.

---

## 📄 License
This project is for educational and portfolio purposes. All rights reserved.
