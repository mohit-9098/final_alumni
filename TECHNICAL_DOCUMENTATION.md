# Technical Documentation: Alumni Networking Portal

> **Note:** This document is optimized for PDF conversion. You can export this to PDF using VS Code (Markdown PDF extension), Pandoc, or online Markdown-to-PDF converters.

---

## 1. Project Overview
The **Alumni Networking Portal** is a full-stack professional networking platform designed to connect students, alumni, and administrators. It facilitates career growth, job placements, and institutional collaboration within a university ecosystem.

## 2. System Architecture
The application utilizes the **MERN Stack** (MongoDB, Express.js, React, Node.js) and follows a client-server architecture.

### Backend (Server-Side)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` for secure password hashing.
- **File Handling:** Multer for processing file uploads.

### Frontend (Client-Side)
- **Library:** React 18
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS for a modern, responsive UI.
- **Icons:** Lucide React
- **State Management:** Context API (Auth and Notifications).
- **API Communication:** Axios with configured proxies.

---

## 3. User Roles and Features

### 3.1 Student
- **Networking:** Browse the alumni directory and connect with professionals.
- **Career:** View and apply for job opportunities posted by alumni.
- **Information:** Access university MOUs (Memorandums of Understanding).
- **Communication:** Direct messaging with alumni for mentorship.
- **Updates:** Receive real-time notifications for events and notices.

### 3.2 Alumni
- **Recruitment:** Post and manage job opportunities for the community.
- **Mentorship:** Connect with current students and fellow alumni.
- **Collaboration:** View institutional partnerships and MOUs.
- **Engagement:** Participate in events and manage professional profiles.

### 3.3 Administrator
- **User Management:** Oversee student, alumni, and other admin accounts.
- **Content Management:** Create and manage MOUs, events, and campus notices.
- **Moderation:** Oversee all job postings and user-generated content.
- **Analytics:** Access system reports and user statistics.

---

## 4. Database Models (Mongoose)

| Model | Key Responsibilities |
| :--- | :--- |
| **User** | Authentication, profile data (Student/Alumni/Admin), and role management. |
| **Job** | Job details, requirements, and management of student applicants. |
| **MOU** | Partnership records between the university and industry entities. |
| **Event** | Scheduling for alumni meets, webinars, and campus activities. |
| **Notice** | Announcements, alerts, and system-wide broadcast updates. |
| **Message** | Direct peer-to-peer communication between alumni and students. |
| **Notification** | Persistent activity alerts and real-time user engagement. |

---

## 5. Security & Authentication Architecture

### 5.1 Stateless Authentication
The system utilizes **JSON Web Tokens (JWT)** to maintain sessions. Upon a successful login, the server issues a signed token which the client stores securely. This token is transmitted in the `Authorization: Bearer <token>` header for all protected API requests.

### 5.2 Middleware Enforcement
A centralized `auth.js` middleware is implemented on the backend to:
1. **Identify:** Verify the signature and validity of the incoming JWT.
2. **Authorize:** Enforce Role-Based Access Control (RBAC) to ensure users only access features permitted for their specific role.

### 5.3 Data Integrity & Protection
- **Bcryptjs:** All user passwords undergo salt-and-hash operations using high-entropy salts before database persistence.
- **Input Sanitization:** The `express-validator` library is integrated into every POST and PUT route to prevent NoSQL injection and Cross-Site Scripting (XSS).
- **Environment Isolation:** Sensitive credentials such as the database URI and JWT Secret are strictly managed via environment variables (`.env`).

---

## 6. Installation & Configuration Guide

### 6.1 Prerequisites
- Node.js (v16.x or higher)
- MongoDB (Local instance or Atlas Cloud)

### 6.2 Setup Steps
1.  **Dependency Bootstrap:** From the project root, run `npm run install-all`. This script automatically installs dependencies for the root, the React client, and the Express server.
2.  **Environment Configuration:** Navigate to the `server/` directory and create a `.env` file with the following variables:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_random_key
    ```
3.  **Execution:** Use `npm run dev` to start the development environment. This utilizes the `concurrently` package to run the frontend (Port 3000) and backend (Port 5000) in a single terminal session.

---
*Technical Documentation - © 2024 Alumni Networking Portal Development Team*