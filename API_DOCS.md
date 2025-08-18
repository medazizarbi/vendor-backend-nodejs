# API Documentation

## Base URL
```
http://localhost:3333/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register Vendor
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Vendor registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vendor": {
    "id": "64f123...",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active"
  }
}
```

#### Login Vendor
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current Vendor
```http
GET /auth/me
Authorization: Bearer <token>
```

### Store Management

#### Create Store
```http
POST /stores
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Store",
  "description": "A great store",
  "logo": "https://example.com/logo.png",
  "banner": "https://example.com/banner.png",
  "socialLinks": {
    "facebook": "https://facebook.com/mystore",
    "instagram": "https://instagram.com/mystore",
    "website": "https://mystore.com"
  }
}
```

#### Get Store
```http
GET /stores
Authorization: Bearer <token>
```

#### Update Store
```http
PUT /stores/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Store Name",
  "description": "Updated description"
}
```

### Product Management

#### Add Product
```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "stock": 100,
  "category": "Electronics",
  "images": ["https://example.com/image1.jpg"],
  "status": "active"
}
```

#### List Products
```http
GET /products?page=1&limit=10&category=Electronics&status=active
Authorization: Bearer <token>
```

#### Get Product
```http
GET /products/:id
Authorization: Bearer <token>
```

#### Update Product
```http
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 39.99,
  "stock": 50
}
```

#### Delete Product
```http
DELETE /products/:id
Authorization: Bearer <token>
```

### Order Management

#### List Orders
```http
GET /orders?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

#### Get Order Details
```http
GET /orders/:id
Authorization: Bearer <token>
```

#### Update Order Status
```http
PUT /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing"
}
```

#### Add Order Note
```http
POST /orders/:id/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Customer requested expedited shipping"
}
```

#### Get Order Notes
```http
GET /orders/:id/notes
Authorization: Bearer <token>
```

#### Create Order (Testing)
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "John Customer",
  "customerEmail": "customer@example.com",
  "items": [
    {
      "productId": "64f123...",
      "quantity": 2,
      "price": 29.99
    }
  ]
}
```

### Dashboard & Analytics

#### Get Dashboard Stats
```http
GET /dashboard/stats?period=month
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: `day`, `week`, `month`, `year`

**Response:**
```json
{
  "period": "month",
  "dateRange": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  },
  "sales": {
    "totalSales": 1250.50,
    "totalOrders": 25,
    "averageOrderValue": 50.02
  },
  "orders": {
    "total": 25,
    "byStatus": {
      "pending": 5,
      "processing": 8,
      "completed": 12
    }
  },
  "products": {
    "total": 50,
    "active": 45,
    "inactive": 5
  }
}
```

#### Get Top Products
```http
GET /dashboard/products?limit=5
Authorization: Bearer <token>
```

#### Get Recent Orders
```http
GET /dashboard/orders?limit=10
Authorization: Bearer <token>
```

#### Get Sales Chart Data
```http
GET /dashboard/sales-chart?period=month
Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Vendor Registration
- `name`: 2-50 characters
- `email`: Valid email format
- `password`: Minimum 6 characters

### Store
- `name`: 2-100 characters
- `description`: Maximum 500 characters
- `socialLinks`: Valid URLs

### Product
- `name`: 2-100 characters
- `description`: Maximum 1000 characters
- `price`: Minimum 0
- `stock`: Minimum 0
- `category`: Required
- `images`: Array of valid URLs

### Order Status Transitions
- `pending` → `processing` or `cancelled`
- `processing` → `completed` or `cancelled`
- `completed` → No transitions allowed
- `cancelled` → No transitions allowed

## Rate Limiting
- 100 requests per 15 minutes per IP address

## CORS
- Cross-origin requests are enabled for all origins in development
