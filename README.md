# SynergySphere-LegalFrame-Team-SynergyBytes

📺 Demo Video: [YouTube Link](https://youtu.be/yLXqBw5iKVY)

---

## 📚 LegalFrame

**LegalFrame** is a smart, cross-platform collaboration tool designed for legal teams. It enables seamless case management, task assignment, document sharing, and real-time collaboration — all in one streamlined workspace and an inbuilt AI clause recommender and legal advisor.

---

## 🚀 Project Overview

LegalFrame is a next-generation collaboration platform built specifically for legal professionals.  
It streamlines how legal teams:

- Manage cases  
- Assign and track tasks  
- Collaborate in real-time  
- Share critical documents securely  

Our platform aligns with the **SynergySphere Challenge Vision**:

> *"Teams do their best work when their tools truly support how they think, communicate, and move forward together."*

LegalFrame is not just another project management tool — it is an intelligent backbone for legal teamwork, proactively assisting, improving efficiency, and enhancing collaboration.

---

## ✨ Key Features

- **Case & Task Management**  
  Create, assign, and track case-related tasks with due dates and status updates (To-Do, In Progress, Done).  

- **Novelty Feature: Smart Constitution Clause Suggestor 🧠**  
  AI-driven module that suggests relevant constitutional clauses based on case details using a keyword-based engine.  

- **Team Collaboration**  
  Project-specific threaded discussions, notes, and real-time updates.  

- **Role-Based Access Control**  
  Define roles (lawyers, paralegals, clients) with appropriate permissions.  

---
🛠️ Backend Routes
🔐 Authentication Routes (Public)

These routes handle user registration, login, and logout.
```
GET    /auth/signup          → Render the sign-up form
POST   /auth/signup          → Handle user registration form submission
GET    /auth/login           → Render the login form
POST   /auth/login           → Handle login form submission
GET    /auth/logout          → Log the user out and destroy session
```

🔒 Application Routes (Protected)
```
All the routes below require users to be logged in. They are protected by the isAuthenticated middleware.
```
📂 Main
```
GET    /                    → Dashboard or landing page (based on implementation)
```
🧾 Cases
```
GET    /cases               → List all cases
GET    /cases/:id           → View details of a specific case
POST   /cases               → Create a new case
PUT    /cases/:id           → Update an existing case
DELETE /cases/:id           → Delete a case
```
👥 Case Members
```
GET    /cases/:caseId/members               → Get all members in a case
POST   /cases/:caseId/members               → Add a member to a case
DELETE /cases/:caseId/members/:memberId     → Remove a member from a case
```
✅ Tasks
```
GET    /cases/:caseId/tasks   → Get all tasks for a case
POST   /cases/:caseId/tasks   → Create a task for a case
PUT    /tasks/:taskId         → Update a task
DELETE /tasks/:taskId         → Delete a task
```
🤖 AI Clause Generator
```
GET    /ai-clause             → Render the AI clause generator page
POST   /ai-clause/generate    → Generate a legal clause using AI
```
🛡️ Middleware
```
isAuthenticated — Middleware that ensures the user is logged in. If not, redirects to /auth/login.
```
Directory Structure
```
LEGALFRAME/
│
├── backend/
│   ├── data/
│   │   └── constitution.json
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── ai-clause.js
│   │   ├── auth.js
│   │   ├── case-members.js
│   │   ├── cases.js
│   │   ├── index.js
│   │   └── tasks.js
│   ├── services/
│   │   └── db.js
│   ├── views/
│   │   ├── ai/
│   │   │   └── clause-recommender.ejs
│   │   ├── cases/
│   │   │   └── case-details.ejs
│   │   ├── index.ejs
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── constitution.json
├── .gitignore
└── README.md
```

## ✅ Full Tech Stack Breakdown

### 🔧 Backend (Server-Side)
- **Node.js** – JavaScript runtime for building server-side logic.  
- **Express.js (v5.x)** – Web framework for routing & handling HTTP requests.  
- **Express-Session** – For managing user sessions.  
- **dotenv** – Loads environment variables securely.  
- **cookie-parser** – Parses cookies (used for authentication/session management).  
- **jsonwebtoken (JWT)** – Token-based authentication.  
- **bcrypt** – Secure password hashing.  

### 🗄 Database
- **MySQL** – Relational database for user, case, and session storage.  
- **mysql2** – Node.js client for MySQL queries.  

### 🎨 Frontend (Client-Side)
- **EJS (Embedded JavaScript Templates)** – Dynamic server-side rendering.  
- **HTML5** – Webpage structure.  
- **CSS3** – Styling for the frontend.  
- **Bootstrap** – Responsive design and UI components.  

### 📦 Package & Module Management
- **npm** – For managing dependencies like `bcrypt`, `express`, `mysql2`, etc.  

---

## 📱 Wireframes (MVP)

- **🔑 Login / Signup**  
  Secure login, register, and forgot password functionality.  

- **📂 Project Dashboard**  
  List of ongoing cases/projects with ability to create new ones.  

- **📋 Task Board**  
  Task list showing title, description, status, and due date.  

- **➕ Task Creation**  
  Form with fields for title, description, and due date.  

---

## 🌟 Vision

LegalFrame aims to **redefine legal collaboration** by combining traditional case/task management with **intelligent clause assistance**.  

Inspired by the SynergySphere mission, LegalFrame is designed to be the **central nervous system for legal teams** — helping them:  
- Work smarter  
- Avoid risks  
- Continuously improve  

---

## ⚡ Future Enhancements

- NLP-powered semantic search for constitutional clauses  
- WebSocket-based real-time updates  
- Document versioning and secure sharing  
- Analytics dashboard for case performance tracking  

---

🙌 Built with passion by **Team SynergyBytes**  
