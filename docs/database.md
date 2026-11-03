# Database Design & ACID Transactions: Inventory Management System

This document outlines the database schema, relational modeling, entity relationships, and transactional integrity guarantees for the **Inventory Management System**.

---

## 1. Entity Relationship Diagram (ERD)

```text
  +------------------+             +--------------------+
  |    categories    |             |     suppliers      |
  +------------------+             +--------------------+
  | id (PK)          |             | id (PK)            |
  | name (UNIQUE)    |             | name               |
  | description      |             | email              |
  | created_at       |             | phone              |
  | updated_at       |             | address            |
  +--------+---------+             | created_at         |
           | 1                     +---------+----------+
           |                                 | 1
           | N                               | N
  +--------+---------------------------------+----------+
  |                      products                       |
  +-----------------------------------------------------+
  | id (PK)                                             |
  | sku (UNIQUE)                                        |
  | name                                                |
  | description                                         |
  | category_id (FK -> categories.id)                   |
  | supplier_id (FK -> suppliers.id)                    |
  | price (DECIMAL 10,2)                                |
  | quantity (INT)                                      |
  | minimum_stock (INT)                                 |
  | created_at                                          |
  | updated_at                                          |
  +--------------------------+--------------------------+
                             | 1
                             |
                             | N
  +--------------------------+--------------------------+
  |               inventory_transactions                |
  +-----------------------------------------------------+
  | id (PK)                                             |
  | product_id (FK -> products.id)                      |
  | user_id (FK -> users.id)                            |
  | type (ENUM 'IN', 'OUT')                             |
  | quantity (INT)                                      |
  | previous_quantity (INT)                             |
  | new_quantity (INT)                                  |
  | reason (VARCHAR 255)                                |
  | created_at (TIMESTAMP)                              |
  +--------------------------+--------------------------+
                             | N
                             |
                             | 1
                    +--------+---------+
                    |      users       |
                    +------------------+
                    | id (PK)          |
                    | name             |
                    | email (UNIQUE)   |
                    | password (HASH)  |
                    | role (ENUM)      |
                    | is_active (BOOL) |
                    | created_at       |
                    | updated_at       |
                    +------------------+
```

---

## 2. Table Specifications

### 1. `users`
Stores system accounts and role authorization privileges.
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(150), NOT NULL, UNIQUE)
- `password` (VARCHAR(255), NOT NULL) — Stored as bcrypt hash.
- `role` (ENUM('ADMIN', 'MANAGER', 'EMPLOYEE'), NOT NULL, DEFAULT 'EMPLOYEE')
- `is_active` (BOOLEAN, NOT NULL, DEFAULT TRUE)
- `created_at` / `updated_at` (TIMESTAMP)

### 2. `categories`
Organizes equipment into business classifications.
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR(100), NOT NULL, UNIQUE)
- `description` (TEXT, NULL)
- `created_at` / `updated_at` (TIMESTAMP)

### 3. `suppliers`
Maintains vendor contact and logistics records.
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `name` (VARCHAR(150), NOT NULL)
- `email` (VARCHAR(150), NOT NULL)
- `phone` (VARCHAR(50), NULL)
- `address` (TEXT, NULL)
- `created_at` / `updated_at` (TIMESTAMP)

### 4. `products`
The core inventory catalog table.
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `sku` (VARCHAR(60), NOT NULL, UNIQUE) — Stock Keeping Unit code.
- `name` (VARCHAR(150), NOT NULL)
- `description` (TEXT, NULL)
- `category_id` (INT, FOREIGN KEY -> `categories.id`, ON DELETE RESTRICT)
- `supplier_id` (INT, FOREIGN KEY -> `suppliers.id`, ON DELETE RESTRICT)
- `price` (DECIMAL(10,2), NOT NULL, DEFAULT 0.00)
- `quantity` (INT, NOT NULL, DEFAULT 0)
- `minimum_stock` (INT, NOT NULL, DEFAULT 5)
- `created_at` / `updated_at` (TIMESTAMP)

### 5. `inventory_transactions`
The immutable audit ledger of every inventory change.
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `product_id` (INT, FOREIGN KEY -> `products.id`, ON DELETE CASCADE)
- `user_id` (INT, FOREIGN KEY -> `users.id`, ON DELETE RESTRICT)
- `type` (ENUM('IN', 'OUT'), NOT NULL)
- `quantity` (INT, NOT NULL)
- `previous_quantity` (INT, NOT NULL)
- `new_quantity` (INT, NOT NULL)
- `reason` (VARCHAR(255), NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

---

## 3. ACID Transactions & Stock Concurrency

### Why Database Transactions are Mandatory
In an inventory management system, stock operations involve multiple related writes:
1. Updating the product's live stock quantity.
2. Appending an audit record to the `inventory_transactions` ledger.

If a crash or failure occurs between step 1 and step 2 without a transaction, inventory counts would shift without an audit trail, corrupting accounting records.

### Stock OUT Transaction Workflow

```text
1. START TRANSACTION (BEGIN)
2. Read product current stock (SELECT FOR UPDATE)
3. Validate: Is current_quantity >= requested_out_quantity?
   - If NO:
     ROLLBACK TRANSACTION
     Return HTTP 400 "Insufficient Stock"
   - If YES:
     new_quantity = current_quantity - requested_out_quantity
     UPDATE products SET quantity = new_quantity WHERE id = product_id
     INSERT INTO inventory_transactions (...)
     COMMIT TRANSACTION
```

This guarantees **Atomicity** (both update and audit log succeed or neither does) and **Consistency** (stock never goes below 0).
