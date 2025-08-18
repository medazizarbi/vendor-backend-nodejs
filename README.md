# Vendor Backend API

A complete Node.js backend API for vendor management with stores, products, and orders.

## 🚀 Features

- **Authentication**: JWT-based vendor authentication
- **Store Management**: Create and manage vendor stores
- **Product Management**: CRUD operations for products with inventory tracking
- **Order Management**: Order processing with status workflow
- **Dashboard Analytics**: Sales analytics and reporting
- **Security**: Rate limiting, CORS, and input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB:**
   - Install MongoDB locally OR use MongoDB Atlas
   - Make sure MongoDB is running on `mongodb://localhost:27017`

3. **Environment Configuration:**
   The `.env` file is already configured with default values:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/vendor-backend
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

6. **Test the API:**
   ```bash
   npm run test-api
   ```

## 🎯 Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Register a vendor:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
   ```

3. **Use the returned token for authenticated requests**

## 📊 Database Schema

### Tables & Relationships

| Table | Fields | Relationships |
|-------|--------|---------------|
| Vendor | id, name, email, password (hashed), createdAt, updatedAt, status | One-to-One with Store |
| Store | id, vendorId, name, description, logo, banner, socialLinks, createdAt, updatedAt | One-to-Many with Product, One-to-Many with Order |
| Product | id, storeId, name, description, price, stock, images, category, createdAt, updatedAt | Many-to-One with Store, One-to-Many with OrderItem |
| Order | id, storeId, customerName, customerEmail, totalAmount, status, createdAt, updatedAt | Many-to-One with Store, One-to-Many with OrderItem |
| OrderNote | id, orderId, content, createdAt | Many-to-One with Order |

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Vendor registration
- `POST /api/auth/login` - Vendor login (returns JWT)
- `GET /api/auth/me` - Get logged-in vendor data

### Store Management
- `POST /api/stores` - Create a store
- `GET /api/stores` - Get vendor's store
- `GET /api/stores/:id` - Get store details
- `PUT /api/stores/:id` - Update store (including social links)

### Product Management
- `POST /api/products` - Add a new product
- `GET /api/products` - List all products (with pagination)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (including stock)
- `DELETE /api/products/:id` - Delete product

### Order Management
- `GET /api/orders` - List all orders (filter by status)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/notes` - Add order note
- `GET /api/orders/:id/notes` - List order notes
- `POST /api/orders` - Create order (for testing)

### Dashboard & Reporting
- `GET /api/dashboard/stats` - Sales analytics (total sales, orders count)
- `GET /api/dashboard/products` - Top-selling products
- `GET /api/dashboard/orders` - Recent orders summary
- `GET /api/dashboard/sales-chart` - Sales chart data

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Sample Data

After running `npm run seed`, you can use these credentials:
- **Email:** john@example.com
- **Password:** password123

## 🧪 Testing

### Automated Testing
```bash
npm run test-api
```

### Manual Testing with Postman
1. Import the `postman-collection.json` file into Postman
2. Set the `baseUrl` variable to `http://localhost:3000/api`
3. Register/login to get a token
4. Set the `token` variable with your JWT token
5. Test all endpoints

## 📚 Documentation

- **API Documentation:** See `API_DOCS.md` for detailed endpoint documentation
- **Postman Collection:** Import `postman-collection.json` for testing

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm run test-api` - Run API tests

## 🏗️ Business Logic

### Stock Management
- When an order status is changed to "completed", product stock is automatically decreased
- If stock reaches 0, product status is automatically set to "out_of_stock"

### Order Workflow
- Status transitions: `pending` → `processing` → `completed`
- Orders can be cancelled from `pending` or `processing` status
- No backward transitions allowed

### Dashboard Analytics
- Calculate sales for different periods (day, week, month, year)
- Track best-selling products
- Monitor order counts by status

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-origin resource sharing enabled
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication with 7-day expiration

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Heroku
- AWS
- DigitalOcean
- Railway
- Vercel (serverless)

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your-production-mongodb-url
JWT_SECRET=your-very-secure-secret-key
```

## 📁 Project Structure

```
vendor-backend-nodejs/
├── models/           # Database models
│   ├── Vendor.js
│   ├── Store.js
│   ├── Product.js
│   ├── Order.js
│   └── OrderNote.js
├── routes/           # API routes
│   ├── auth.js
│   ├── stores.js
│   ├── products.js
│   ├── orders.js
│   └── dashboard.js
├── middleware/       # Custom middleware
│   └── auth.js
├── index.js          # Main server file
├── seed.js           # Database seeder
├── test-api.js       # API testing script
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── package.json      # Dependencies and scripts
├── README.md         # This file
├── API_DOCS.md       # Detailed API documentation
└── postman-collection.json  # Postman collection
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details

---

**🎉 Your vendor backend API is now ready! Start by running `npm run dev` and then test with `npm run test-api`**
