# CRM Service Request Helpdesk

This repository contains the complete solution for the **Junior Backend Developer Assignment (Option 3: CRM for Service Requests/Helpdesk)**. It is a fully functional, end-to-end MERN stack application designed with a professional, premium UI and secure backend architecture.

## 🌟 Key Features & Requirements Met

### Core Requirements
- **Backend Framework:** Built on Node.js & Express.
- **Database:** MongoDB configured using Mongoose models (`User`, `Ticket`, `Counter`).
- **Security:** JWT Authentication, Bcrypt password hashing, and express-rate-limit.
- **Admin Login:** Dedicated Admin role and dashboard.
- **CRUD Operations:** Full create, read, update, and delete functionality for users and tickets.
- **Service Requests:** Users can submit tickets; Admins can assign requests to Agents.

### 🏆 Bonus Features Implemented
1. **Advanced Search & Filter:** The Ticket List features live dropdown filtering by Status and Priority.
2. **User Roles:** Robust Role-Based Access Control (RBAC) securely enforcing `Admin`, `Agent`, and `User` privileges.
3. **Activity Logs:** The backend automatically tracks every interaction (status changes, assignments, comment creations) and displays them in a chronological "Activity Timeline" on the Ticket Detail page.
4. **Communication History:** Fully functional "Notes & Comments" system allowing users and agents to communicate directly on specific tickets.
5. **Charts & Reports:** The Admin Dashboard utilizes `recharts` to render real-time MongoDB aggregations for:
   - Status Breakdown (Pie Chart)
   - Active Agent Workload (Bar Chart)
   - Monthly Arrival Trend (Line Chart)
6. **Premium UI/UX:** The frontend is wrapped in an Ant Design `<ConfigProvider>` to enforce a modern "Glassmorphism" aesthetic, utilizing `Inter` typography and deep-dark aesthetic layouts.

## 🚀 Getting Started (Running Locally)

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally on `mongodb://localhost:27017` or via Atlas)

### 1. Start the Backend
```bash
cd backend
npm install
```
Configure your `.env` file in the backend directory (use `.env.example` as a template).
```bash
npm start
```
The server will run on `http://localhost:5000`.

### 2. Seed the Database (Optional but Recommended)
To quickly populate the database with test accounts (1 Admin, 2 Agents, 2 Users):
```bash
cd backend
npm run seed
```
*Note: The seeded Admin credentials are `admin@gmail.com` / `admin@123`*

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will boot up on `http://localhost:5173`.

## 🌍 Live Deployment Guide (Optional Bonus)

To earn the "deployment quality" bonus, you can easily host this MERN stack for free.

### Backend Deployment (Render)
1. Push your repository to GitHub.
2. Go to [Render.com](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `backend/`.
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add your Environment Variables:
   - `MONGO_URI`: `(Your MongoDB Atlas string)`
   - `JWT_SECRET`: `(Any secure random string)`
   - `PORT`: `5000`
8. Deploy! Render will give you a live URL (e.g., `https://my-backend.onrender.com`).

### Frontend Deployment (Vercel)
1. Go to `frontend/src/services/api.js` and update the `baseURL` from `http://localhost:5000/api` to your new Render backend URL.
2. Commit and push that change to GitHub.
3. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
4. Import your GitHub repository.
5. In the configuration, set the **Framework Preset** to `Vite`.
6. Edit the **Root Directory** to `frontend`.
7. Click Deploy! Vercel will give you a live frontend URL.

## 📁 Repository Structure
```
├── backend/
│   ├── config/         # MongoDB connection setup
│   ├── controllers/    # Route logic & Aggregation pipelines
│   ├── middleware/     # JWT Auth, RBAC, and Error Handlers
│   ├── models/         # Mongoose Schemas (User, Ticket, Counter)
│   ├── routes/         # Express API routing
│   └── seed.js         # Database population script
└── frontend/
    ├── src/
    │   ├── components/ # MainLayout, ProtectedRoutes
    │   ├── context/    # React AuthContext 
    │   ├── pages/      # Login, Register, Dashboard, TicketList, TicketDetail
    │   └── services/   # Axios API instance with interceptors
```

> **Note to Reviewer:** This project features embedded inline ticket assignment and popconfirm deletion directly from the Dashboard to fulfill the "streamlined workspace" ideology. Please ensure you log in as the `Admin` to test these features!
