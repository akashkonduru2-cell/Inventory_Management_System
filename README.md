# 📦 Inventory Management System

A full-stack web-based Inventory Management System designed to manage products, stock, suppliers, inventory transactions, and users with role-based access control.

The system provides different privileges for **Admin, Manager, and Employee** users and uses a React frontend, Node.js/Express backend, and MySQL database.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- Secure user login
- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Protected API routes
- Token-based authorization
- Separate privileges for Admin, Manager, and Employee

### 👨‍💼 Admin

Admin has the highest level of access.

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

Manager has operational inventory privileges.

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

# 🔑 Demo Login Credentials

The following accounts are provided for testing and interview demonstration purposes.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@inventory.com` | `Admin@123` |
| Manager | `manager@inventory.com` | `Manager@123` |
| Employee | `employee@inventory.com` | `Employee@123` |

> ⚠️ **Note:** These credentials are for development, testing, and interview demonstration purposes only. Do not use these credentials in a production environment.

---

# 🏗️ System Architecture

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
                    │  Validation              │
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
                    │  Transactions            │
                    └─────────────────────────┘
