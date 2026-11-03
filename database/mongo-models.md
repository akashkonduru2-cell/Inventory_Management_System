# MongoDB Collections & Mongoose Data Models

This document describes the schema architecture and collections for the MongoDB-based Inventory Management System.

---

## 1. Collections Overview

| Collection Name | Mongoose Model | Description | Indexes |
| :--- | :--- | :--- | :--- |
| `users` | `User` | Application users with bcrypt-hashed passwords & roles | `email` (unique), `role` |
| `categories` | `Category` | Classification categories for products | `name` (unique) |
| `suppliers` | `Supplier` | Vendors and distributor contact details | `name` |
| `products` | `Product` | Catalog items with SKU, price (INR), stock, and minimum safety threshold | `sku` (unique), `category_id`, `supplier_id`, `quantity` |
| `transactions` | `Transaction` | Audit ledger for Stock IN and Stock OUT operations | `product_id`, `user_id`, `type`, `created_at` |

---

## 2. Schema Definitions

### User Schema (`users`)
```javascript
{
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE' },
  is_active: { type: Boolean, default: true },
  created_at: Date,
  updated_at: Date
}
```

### Category Schema (`categories`)
```javascript
{
  name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', trim: true },
  created_at: Date,
  updated_at: Date
}
```

### Supplier Schema (`suppliers`)
```javascript
{
  name: { type: String, required: true, trim: true, maxlength: 150 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  address: { type: String, default: '', trim: true },
  created_at: Date,
  updated_at: Date
}
```

### Product Schema (`products`)
```javascript
{
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 60 },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, default: '', trim: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, default: 0, min: 0 },
  minimum_stock: { type: Number, default: 5, min: 0 },
  created_at: Date,
  updated_at: Date
}
```

### Transaction Schema (`transactions`)
```javascript
{
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['IN', 'OUT'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  previous_quantity: { type: Number, required: true },
  new_quantity: { type: Number, required: true },
  reason: { type: String, default: '', trim: true },
  created_at: Date,
  updated_at: Date
}
```
