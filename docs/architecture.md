# System Architecture: Full-Stack Inventory Management System

This document provides a beginner-friendly, comprehensive architectural breakdown of the **Inventory Management System (IMS)** full-stack web application.

---

## 1. High-Level Architecture (3-Tier Monolith)

The application follows a standard **3-Tier Client-Server Monolithic Architecture**:

```text
               CLIENT TIER (Presentation Layer)
               +------------------------------+
               |  React.js + Vite (Port 5173) |
               |  - Component UI / Pages      |
               |  - Context API (Auth State)  |
               |  - Axios (JWT Interceptor)   |
               +--------------+---------------+
                              | HTTP / REST (JSON)
                              v
               SERVER TIER (Application / Business Logic)
               +------------------------------+
               | Node.js + Express (Port 5000)|
               |  - Middleware (Auth & RBAC)  |
               |  - Route Handlers            |
               |  - Controllers & Validators  |
               |  - Services (Business Logic) |
               +--------------+---------------+
                              | SQL / Connection Pool
                              v
               DATA TIER (Persistence Layer)
               +------------------------------+
               |        MySQL Database        |
               |  - users, products, etc.     |
               |  - Foreign Key Constraints   |
               |  - ACID Stock Transactions   |
               +------------------------------+
```

---

## 2. Request-Response Lifecycle

When a user interacts with the application (e.g. clicking **Stock OUT** to dispatch 5 units of a product):

```text
1. [User Interaction]
   User inputs 5 units on React UI and clicks "Confirm Stock OUT".

2. [Client-Side Validation]
   React validates that quantity > 0 and <= available stock in state.

3. [HTTP Request]
   Axios sends `POST /api/inventory/stock-out` with `Authorization: Bearer <JWT>` header.

4. [Authentication Middleware]
   `authMiddleware.js` extracts the JWT, verifies the cryptographic signature,
   checks user status in the database, and attaches `req.user`.

5. [Authorization Middleware]
   `roleMiddleware.js` validates that `req.user.role` is authorized (ADMIN, MANAGER, or EMPLOYEE).

6. [Input Validation Middleware]
   `validationMiddleware.js` (express-validator) sanitizes and validates request payload.

7. [Controller Layer]
   `inventoryController.js` receives `req.body`, extracts `product_id`, `quantity`, `reason`,
   and invokes `InventoryService.stockOut()`.

8. [Service Layer (Business Logic & Transactions)]
   `inventoryService.js` initiates a MySQL transaction:
   - Locks/reads current product stock: `SELECT quantity FROM products WHERE id = ?`.
   - Checks if `current_stock >= requested_quantity`.
   - If insufficient: Rollback & throw error.
   - If sufficient: Executes `UPDATE products SET quantity = ?` and `INSERT INTO inventory_transactions`.
   - Commits transaction atomically.

9. [Database Layer]
   MySQL executes the queries, updates disk storage, and returns confirmation.

10. [JSON Response]
    Express sends HTTP 200 `{ success: true, message: 'Stock OUT recorded successfully', data: {...} }`.

11. [State Update & UI Re-render]
    React state updates, table refreshes with new stock, and a success alert displays.
```

---

## 3. Backend Layered Structure

The backend is separated into distinct layers to enforce the **Single Responsibility Principle (SRP)**:

| Layer | Path | Primary Responsibility |
| :--- | :--- | :--- |
| **Routes** | `src/routes/` | Declares URL endpoints, HTTP methods, and chains middleware. |
| **Middleware** | `src/middleware/` | Enforces cross-cutting concerns: JWT authentication, RBAC, schema validation, global error handling. |
| **Validators** | `src/validators/` | Defines declarative input validation rules using `express-validator`. |
| **Controllers** | `src/controllers/` | Extracts HTTP params/body, delegates to services, and formats standard HTTP responses. |
| **Services** | `src/services/` | Contains all business logic, calculations, and manages ACID database transactions. |
| **Models / DB** | `src/models/` & `src/config/` | Executes parameterized SQL queries against MySQL connection pool. |

---

## 4. Frontend Architecture

The frontend is structured into modular components:

- **Context API (`AuthContext.jsx`)**: Centralizes user authentication state, token storage in `localStorage`, and provides role authorization helper methods (`isAdmin`, `canStockIn`, etc.).
- **Axios Interceptors (`api.js`)**: Automatically injects `Authorization: Bearer <token>` on outgoing requests and intercepts `401 Unauthorized` responses to gracefully log out expired sessions.
- **Routing & Guards (`ProtectedRoute.jsx`, `RoleGuard.jsx`)**: Prevents unauthenticated access and ensures unauthorized roles cannot view restricted administrative views.
- **Visualizations (`Recharts`)**: Responsive charts for category distributions, stock movements, and financial inventory valuation.

---

## 5. Security Architecture

1. **Password Hashing**: Passwords are never stored in plain text. They are hashed using **bcrypt** with a salt round cost of 10.
2. **Stateless JWT Authentication**: Tokens contain user identifier, email, and role, signed with an HMAC-SHA256 secret.
3. **Dual-Layer RBAC**: Role restrictions are enforced **both** in the frontend UI (hiding controls) and on the backend API (rejecting requests with HTTP 403).
4. **SQL Injection Prevention**: All queries use **parameterized placeholders (`?`)** through `mysql2/promise`.
