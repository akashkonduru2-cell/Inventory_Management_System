
# 📦 Inventory Management System

A full-stack web-based **Inventory Management System** designed to efficiently manage products, stock levels, suppliers, inventory transactions, and users with role-based access control.

The application provides different levels of access for **Admin, Manager, and Employee** users. It is built using React.js for the frontend, Node.js and Express.js for the backend, and MySQL for database management.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- Secure user login
- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Token-based authorization
- Separate privileges for Admin, Manager, and Employee

### 👨‍💼 Admin

Admin has the highest level of access across the application.

- Manage users
- Manage products
- Manage categories
- Manage suppliers
- View inventory
- View stock transactions
- Access dashboard and reports
- Add, edit, and remove inventory data
- Full system access

### 👨‍💼 Manager

Manager has operational inventory management privileges.

- View dashboard
- Manage products
- Manage suppliers
- Manage inventory
- Record stock IN/OUT transactions
- View inventory reports
- View product information

Managers do not have full user administration privileges.

### 👷 Employee

Employee has limited operational access.

- View products
- View inventory
- Perform permitted stock operations
- View relevant inventory information
- View transaction information according to permissions

Employees cannot access administrative functionality.

---

## 🔑 Demo Login Credentials

The following accounts are provided for testing and demonstration purposes.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@inventory.com` | `Admin@123` |
| Manager | `manager@inventory.com` | `Manager@123` |
| Employee | `employee@inventory.com` | `Employee@123` |

> ⚠️ These credentials are intended for development and demonstration purposes only. Do not use them in production.

---

## 🏗️ System Architecture

The application follows a **three-tier architecture**.

```text
                 ┌─────────────────────────┐
                 │        FRONTEND         │
                 │        React.js         │
                 │                         │
                 │  Login                  │
                 │  Dashboard              │
                 │  Products               │
                 │  Inventory              │
                 │  Suppliers              │
                 │  Reports                │
                 └────────────┬────────────┘
                              │
                           REST API
                              │
                              ▼
                 ┌─────────────────────────┐
                 │         BACKEND         │
                 │   Node.js + Express.js  │
                 │                         │
                 │  Authentication         │
                 │  Authorization          │
                 │  Business Logic         │
                 │  API Routes             │
                 │  Validation             │
                 └────────────┬────────────┘
                              │
                         SQL Queries
                              │
                              ▼
                 ┌─────────────────────────┐
                 │        DATABASE         │
                 │          MySQL          │
                 │                         │
                 │  Users                  │
                 │  Products               │
                 │  Categories             │
                 │  Suppliers              │
                 │  Transactions           │
                 └─────────────────────────┘
```

---

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt

### Database
- MySQL

### Tools
- Visual Studio Code
- Git
- GitHub
- MySQL Workbench
- Postman

---

## 💻 How to Run Locally

Follow these steps to download and run the project on your local machine.

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/akashkonduru2-cell/Inventory_Management_System.git
```

Navigate to the project directory:

```bash
cd Inventory_Management_System
```

### Step 2: Configure the Database

1. Start your MySQL server.
2. Open MySQL Workbench.
3. Create the project database.
4. Import the SQL database file provided in the repository, if available.
5. Configure the database connection details in the backend environment file.

Example `.env` configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_management
JWT_SECRET=your_secret_key
```

Replace the example values with your actual database credentials and configuration.

### Step 3: Install Backend Dependencies

Open a terminal in the project directory:

```bash
cd backend
npm install
```

Start the backend server using the available script:

```bash
npm start
```

If the project uses a development script, run:

```bash
npm run dev
```

### Step 4: Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

### Step 5: Access the Application

Once the frontend and backend servers are running, open the frontend URL displayed in your terminal.

Default Vite development URL:

```text
http://localhost:5173
```

You can now log in using the demo credentials provided above.

---

## 🔄 Application Workflow

1. The user opens the application and logs in.
2. The backend verifies the credentials.
3. JWT authentication is used to authorize the user.
4. The system identifies the user's role.
5. The frontend displays the permitted features.
6. Users perform inventory operations according to their permissions.
7. The backend processes requests and communicates with the MySQL database.
8. Updated inventory information is displayed on the dashboard.

---

## 🔒 Security Features

- Password hashing using bcrypt.
- JWT-based authentication.
- Role-based authorization.
- Protected backend API routes.
- Server-side request validation.
- Restricted access to administrative operations.

---

## 🎯 Project Objectives

- Simplify inventory management operations.
- Maintain accurate stock information.
- Improve product and supplier management.
- Track stock IN/OUT transactions.
- Provide secure, role-based access.
- Reduce manual inventory management efforts.
- Provide an organized dashboard for inventory monitoring.

---

## 👨‍💻 Author

**Akash Konduru**

GitHub: [@akashkonduru2-cell](https://github.com/akashkonduru2-cell)

Project Repository: [Inventory Management System](https://github.com/akashkonduru2-cell/Inventory_Management_System)

---

⭐ If you find this project useful, consider giving the repository a star!
