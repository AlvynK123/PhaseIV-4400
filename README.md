# Airline Database Management System

Application for managing airline data, including airplanes and passengers.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

## Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
```

2. Set up the database
```bash
# Log into MySQL and run the database.sql script
mysql -u root -p
# Note that within index.js as well as db.js must replace "REPLACE PASSWORD" with your actual sql password
```

3. Set up the backend
```bash
cd server
npm install
# Start the server
node index.js
# might have to run 
npx nodemon server.js
```

4. Set up the frontend
```bash
cd client
npm install
# Start the server
npm start
# Might Also Need UI:
npm install antd
```

## Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js         # Main App component
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   ├── database.sql       # Database schema
│   └── package.json
└── README.md
```

Members & Work Distribution:
```bash
Alvyn - Project Setup, General Functionality, Frontend + Backend, error handling 
Victor - Project Setup, General Functionality, Frontend + Backend, error handling
Tracy - Repo fixes, error handling
Wesley - Repo fixes, error handling
```

