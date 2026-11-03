# REST API Specification: Inventory Management System

All API endpoints return standard JSON responses and use standard HTTP status codes.

### Base URL: `http://localhost:5000/api`

---

## 1. Standard Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

---

## 2. Authentication Endpoints

### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@inventory.com",
    "password": "Admin@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@inventory.com",
        "role": "ADMIN",
        "is_active": 1
      }
    }
  }
  ```

### `GET /api/auth/me`
- **Access**: Authenticated (Bearer Token)
- **Response (200 OK)**: Returns the current authenticated user profile.

---

## 3. Product Endpoints

### `GET /api/products`
- **Access**: Authenticated (All roles: ADMIN, MANAGER, EMPLOYEE)
- **Query Parameters**:
  - `search` (string): Search in product name, SKU, description
  - `category_id` (integer): Filter by category
  - `supplier_id` (integer): Filter by supplier
  - `stock_status` (string): `IN_STOCK` | `LOW_STOCK` | `OUT_OF_STOCK`

### `POST /api/products`
- **Access**: Restricted (`ADMIN`, `MANAGER`)
- **Request Body**:
  ```json
  {
    "sku": "COMP-LAP-009",
    "name": "Lenovo ThinkPad X1 Carbon",
    "description": "14-inch Ultrabook i7 32GB 1TB SSD",
    "category_id": 1,
    "supplier_id": 2,
    "price": 1499.00,
    "quantity": 10,
    "minimum_stock": 4
  }
  ```
- **Response (201 Created)**

### `PUT /api/products/:id`
- **Access**: Restricted (`ADMIN`, `MANAGER`)

### `DELETE /api/products/:id`
- **Access**: Restricted (`ADMIN` only)

---

## 4. Inventory & Stock Operations

### `GET /api/inventory`
- **Access**: Authenticated (All roles)
- **Response (200 OK)**: Returns current stock, thresholds, and live computed stock status.

### `POST /api/inventory/stock-in`
- **Access**: Restricted (`ADMIN`, `MANAGER`)
- **Request Body**:
  ```json
  {
    "product_id": 1,
    "quantity": 10,
    "reason": "PO-9912 shipment received"
  }
  ```

### `POST /api/inventory/stock-out`
- **Access**: Restricted (`ADMIN`, `MANAGER`, `EMPLOYEE`)
- **Request Body**:
  ```json
  {
    "product_id": 1,
    "quantity": 3,
    "reason": "Order #402 dispatch"
  }
  ```
- **Error Response (400 Bad Request if insufficient stock)**:
  ```json
  {
    "success": false,
    "message": "Insufficient stock. Available stock is 2 unit(s), but requested OUT is 3 unit(s)."
  }
  ```

### `GET /api/inventory/low-stock`
- **Access**: Authenticated (All roles)
- **Response (200 OK)**: Returns all products where `quantity <= minimum_stock`.

---

## 5. Audit Transactions

### `GET /api/transactions`
- **Access**: Authenticated (All roles)
- **Query Parameters**:
  - `type` (`IN` | `OUT`)
  - `product_id` (integer)
  - `start_date` (`YYYY-MM-DD`)
  - `end_date` (`YYYY-MM-DD`)

---

## 6. User Administration

### `GET /api/users`
- **Access**: Restricted (`ADMIN` only)

### `POST /api/users`
- **Access**: Restricted (`ADMIN` only)
- **Request Body**:
  ```json
  {
    "name": "Jane Developer",
    "email": "jane@company.com",
    "password": "Password@123",
    "role": "EMPLOYEE",
    "is_active": 1
  }
  ```

### `PATCH /api/users/:id/status`
- **Access**: Restricted (`ADMIN` only)
- **Request Body**: `{ "is_active": 0 }`

---

## 7. Dashboard & Reports

- `GET /api/dashboard/stats`: Returns KPI totals (products, total stock, stock valuation, low stock count).
- `GET /api/dashboard/recent-transactions`: Returns recent 10 transactions.
- `GET /api/dashboard/reports`: Returns aggregated valuation, category distribution, stock flow trends, and high-turnover items.
