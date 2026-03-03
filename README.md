# Proxima Skills - CRM Service Request Helpdesk

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
