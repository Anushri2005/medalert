# MedAlert+ 

MedAlert+ is a full-stack medication reminder web application that helps users
manage medicines, receive reminders, and track medication history.
It also supports caretaker email alerts for missed medicines.

---

## 🚀 Features

- User authentication (Signup & Login using JWT)
- Add, view, delete medicines
- Mark medicine as taken
- Missed medicine detection
- Sound + browser notifications
- Caretaker email alert (EmailJS)
- Secure backend API
- Responsive UI

---

## 🛠 Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- EmailJS
- Browser Notifications API

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- Bcrypt

---

## 📂 Project Structure
medalert/
│
├── frontend/
│ ├── login.html
│ ├── signup.html
│ ├── dashboard.html
│ ├── dashboard.js
│ ├── api.js
│ └── styles.css
│
├── backend/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── server.js
│ └── package.json
│
└── README.md

---

## ⚙️ How to Run Locally

### 1️⃣ Clone the repository
git clone https://github.com/<your-username>/medalert.git
cd medalert

2️⃣ Backend setup
cd backend
npm install
Create a .env file in backend/:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Start backend:
node server.js

3️⃣ Frontend setup
Open frontend folder in VS Code
Right-click login.html → Open with Live Server

🔐 Security
Passwords are hashed using bcrypt
JWT used for authentication
.env file is excluded from GitHub






