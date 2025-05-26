# 🩺 MediConnect App

A full-stack healthcare appointment platform that connects Patients with Doctors for seamless registration, login, and appointment scheduling.

Built with:

- React.js & Ant Design (Frontend)
- Node.js + Express (Backend API)
- Firebase Firestore (NoSQL Database)

---

## 🔧 Prerequisites

- Node.js and npm installed
- Firebase project set up (Firestore )

---

## Features

- Doctor and Patient Registration/Login
- Patients can book appointments with doctors
- Doctors can view and confirm/reject/reschedule appointments
- Role-based dashboard rendering (Doctor/Patient)

---

### Important Notes for Running the Project

- The repository does not include `server/serviceAccountKey.json` (Google Cloud service account credentials) for security reasons.
- To run this project, you need to create your own Google Cloud service account key with appropriate permissions.
- Place your own `serviceAccountKey.json` file inside the `server/` directory.


---

## 🛠 Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | React.js, Ant Design UI |
| Backend  | Node.js, Express.js     |
| Database | Firebase Firestore      |

---

## STEPS TO RUN THE APPLICATION

1. Clone the Repository

2. Frontend Setup (React + Ant Design)
   --> cd client
   --> npm install
   --> npm start

3. Backend Setup (Express.js + Firebase)
   --> cd server
   --> npm install
   --> node server.js
