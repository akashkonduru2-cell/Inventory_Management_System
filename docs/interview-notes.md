# Interview Preparation Guide: Full-Stack Inventory Management System

This document is designed as a concise, high-impact cheat sheet for explaining and defending this project during technical software engineering interviews.

---

## 1. The 60-Second Elevator Pitch

> *"I built a full-stack **Inventory Management System (IMS)** using React, Node.js/Express, and MySQL. It features role-based access control across Admin, Manager, and Employee roles, full CRUD workflows for products, categories, and suppliers, and real-time dashboard analytics.*
>
> *The core engineering highlight is the **ACID-compliant inventory engine**: stock dispatch and replenishment operations execute inside database transactions to strictly prevent negative inventory, ensure race condition safety, and guarantee an immutable audit ledger for every unit of stock moved."*

---

## 2. Key Architectural Decisions & Rationale

### Q: Why a 3-Tier Layered Monolith instead of Microservices?
**Answer:**
For an internal enterprise inventory system of this scope, a layered monolith (Routes → Controllers → Services → Models) maximizes developer velocity, eliminates distributed transaction overhead (like the 2-phase commit problem across microservice databases), and keeps atomic stock operations simple, fast, and testable within a single MySQL database instance.

---

### Q: Why use MySQL and ACID transactions instead of a NoSQL database like MongoDB?
**Answer:**
Inventory systems demand **strict consistency (ACID)** over eventual consistency. If two employees attempt to dispatch the last 5 laptops at the exact same moment:
- A relational database with transactions and row locking ensures only one transaction commits while the second receives an `Insufficient Stock` error.
- Foreign keys (`ON DELETE RESTRICT`) ensure categories and suppliers cannot be deleted if products depend on them, preventing orphaned records.

---

### Q: How is Authentication and Role-Based Access Control (RBAC) structured?
**Answer:**
- **Authentication**: Uses stateless JSON Web Tokens (JWT) signed with HMAC-SHA256. Passwords are salted and hashed using **bcrypt** (10 salt rounds) and never stored in plain text.
- **Dual-Layer RBAC**: 
  1. *Frontend*: React Context (`AuthContext.jsx`) and `RoleGuard.jsx` dynamically render controls based on role (e.g. Employee cannot see "Add Product" buttons).
  2. *Backend*: `roleMiddleware.js` verifies the user's role on every incoming request. Even if a user bypasses the UI via Postman, the backend rejects unauthorized actions with HTTP 403 Forbidden.

---

### Q: How do you prevent negative inventory during high-concurrency Stock OUT?
**Answer:**
In `InventoryService.js`, the Stock OUT operation:
1. Opens a database transaction (`BEGIN TRANSACTION`).
2. Reads the product row with lock (`SELECT ... FOR UPDATE` in MySQL).
3. Evaluates if `current_stock >= requested_units`.
4. If false, the transaction immediately issues `ROLLBACK` and returns HTTP 400.
5. If true, it updates the stock quantity and writes an audit record to `inventory_transactions` in the same atomic transaction before issuing `COMMIT`.

---

## 3. Role Privileges Matrix

| Capability | ADMIN | MANAGER | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| View Dashboard & Reports | ✓ | ✓ | ✓ |
| View Products, Categories, Suppliers | ✓ | ✓ | ✓ |
| Add / Edit Products | ✓ | ✓ | ✗ |
| Delete Products | ✓ | ✗ | ✗ |
| Add / Edit / Delete Categories & Suppliers | ✓ | ✓ | ✗ |
| Stock IN (Intake Replenishment) | ✓ | ✓ | ✗ |
| Stock OUT (Dispatch Order) | ✓ | ✓ | ✓ |
| View Audit Transaction Ledger | ✓ | ✓ | ✓ |
| User Administration (Provision, Deactivate, Roles) | ✓ | ✗ | ✗ |

---

## 4. Common Technical Questions & Answers

### 1. "What HTTP status codes does the API return and why?"
- `200 OK`: Successful read or update operations.
- `201 Created`: Successfully created a product, category, supplier, or user.
- `400 Bad Request`: Input validation failure or business rule violation (e.g. insufficient stock).
- `401 Unauthorized`: Missing, expired, or invalid JWT authentication token.
- `403 Forbidden`: Authenticated user lacks the role permissions for the endpoint.
- `404 Not Found`: Resource ID does not exist in database.
- `409 Conflict`: Duplicate unique key (e.g. email or SKU already taken).
- `500 Internal Server Error`: Unhandled server exception.

### 2. "How did you handle error handling and input validation?"
- Input validation is declared using `express-validator` on all routes before reaching the controller.
- All service methods throw descriptive errors with custom `statusCode` properties.
- A centralized error middleware (`errorMiddleware.js`) intercepts all errors and returns uniform JSON responses.

### 3. "If you had more time, what would you add next?"
1. **Multi-Warehouse Support**: Supporting multiple physical branch locations and inter-warehouse stock transfers.
2. **Barcode / QR Code Scanner**: Integrating camera barcode scanning on the mobile view for fast stock in/out.
3. **Automated Supplier Purchase Orders**: Triggering automated email notifications to suppliers when stock falls below minimum threshold.
4. **Redis Cache**: Caching catalog reads to handle tens of thousands of concurrent product lookups.
