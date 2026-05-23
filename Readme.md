# 🚀 Full-Stack Interview Platform

A modern full-stack platform designed to simulate real technical interviews with live coding, video interaction, and automated evaluation.  
This project demonstrates my skills in full-stack development, real-time communication, secure code execution, and modern developer tooling.

---

## ✨ Key Features

- 🧑‍💻 Built-in VS Code style code editor for writing and testing solutions
- 🔐 Secure authentication using Clerk
- 🎥 1-on-1 video interview rooms for real-time interaction
- 🧭 Dashboard with live activity and performance stats
- 🎙️ Mic & camera toggle controls
- 🖥️ Screen sharing and session recording
- 💬 Real-time chat between interviewer and candidate
- ⚙️ Secure code execution in isolated environment
- 🎯 Automatic feedback based on test case results
- 🎉 Confetti animation on successful submission
- 🔔 Notifications for failed test cases
- 🧩 Practice problems page for individual coding practice
- 🔒 Room locking system (only 2 participants allowed)
- 🧠 Background job handling using Inngest
- 🧰 REST API built with Node.js and Express
- ⚡ Efficient data fetching using TanStack Query
- 🤖 CodeRabbit integration for PR review and code quality improvements
- 🧑‍💻 Proper Git & GitHub workflow (branches, pull requests, merges)
- 🚀 Deployment on Sevalla (free tier)

---

## 🛠️ Tech Stack

### Frontend
- React.js
- TanStack Query
- Clerk Authentication
- Stream Video SDK
- Modern UI components

### Backend
- Node.js
- Express.js
- MongoDB
- Inngest (background jobs)

### Tools & Services
- Git & GitHub
- CodeRabbit
- Clerk Auth
- Stream API
- Sevalla Deployment

---

## 📂 Project Structure

root
│
├── frontend
│   ├── components
│   ├── pages
│   ├── hooks
│   └── services
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   └── utils
│
└── README.md

---

## 🧪 Environment Variables

### Backend (.env inside /backend)

PORT=3000  
NODE_ENV=development  

DB_URL=your_mongodb_connection_url  

INNGEST_EVENT_KEY=your_inngest_event_key  
INNGEST_SIGNING_KEY=your_inngest_signing_key  

STREAM_API_KEY=your_stream_api_key  
STREAM_API_SECRET=your_stream_api_secret  

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key  
CLERK_SECRET_KEY=your_clerk_secret_key  

CLIENT_URL=http://localhost:5173  

---

### Frontend (.env inside /frontend)

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key  

VITE_API_URL=http://localhost:3000/api  

VITE_STREAM_API_KEY=your_stream_api_key  

---

## ⚙️ Running the Project Locally

### 1️⃣ Start Backend

cd backend  
npm install  
npm run dev  

---

### 2️⃣ Start Frontend

cd frontend  
npm install  
npm run dev  

---

## 🎯 What I Learned

Through this project, I improved my understanding of:

- Building scalable full-stack applications
- Implementing real-time features (video, chat)
- Secure authentication and authorization
- Managing async background jobs
- Writing clean REST APIs
- Handling environment variables securely
- Git workflow and collaboration practices
- Deploying production-ready applications

---

## 🚀 Future Improvements

- Add group interview support
- AI-based interview feedback
- Performance analytics dashboard
- More coding question categories
- Dark/light theme toggle

---

## 👨‍💻 Author

Navjot Kumar Singh  

If you like this project, consider giving it a ⭐ on GitHub.