# MERN Auth Backend
> JWT Authentication · Image Upload (Local/Cloudinary) · Mock Payment API · Postman Tests

---

## Project Structure

```
project/
├── config/
│   ├── db.js              ← MongoDB connection
│   └── cloudinary.js      ← Smart upload (local or Cloudinary)
├── middleware/
│   ├── authMiddleware.js  ← JWT protect + adminOnly
│   ├── errorMiddleware.js ← Global error handler + 404
│   └── validate.js        ← express-validator helper
├── models/
│   ├── User.js            ← Schema with bcrypt pre-save hook
│   ├── Product.js         ← Schema with image fields
│   └── Payment.js         ← Transaction records
├── routes/
│   ├── authRoutes.js      ← Register, Login, Me, Update profile
│   ├── productRoutes.js   ← CRUD + Multer image upload
│   └── paymentRoutes.js   ← Mock payment + history
├── uploads/               ← Local images stored here
├── .env.example           ← Copy to .env and fill in
├── server.js
├── package.json
└── MERN_Auth_Postman_Collection.json
```

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET etc.

# 3. Make sure MongoDB is running
# macOS/Linux: brew services start mongodb-community
# Windows: net start MongoDB

# 4. Start server
npm run dev        # with auto-reload (nodemon)
# or
npm start          # production mode

# Visit http://localhost:5000 → should show JSON health check
```

---

## API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint   | Auth | Body / Params                        | Description         |
|--------|------------|------|--------------------------------------|---------------------|
| POST   | /register  | No   | `name, email, password`              | Register new user   |
| POST   | /login     | No   | `email, password`                    | Login → get token   |
| GET    | /me        | ✅   | —                                    | Get own profile     |
| PATCH  | /me        | ✅   | `name?, email?`                      | Update profile      |

### Product Routes — `/api/products`

| Method | Endpoint   | Auth | Body / Params                                    | Description         |
|--------|------------|------|--------------------------------------------------|---------------------|
| POST   | /          | ✅   | form-data: `name, price, description, image`     | Create product      |
| GET    | /          | No   | Query: `page, limit, search, category`           | List products       |
| GET    | /:id       | No   | —                                                | Get single product  |
| PUT    | /:id       | ✅   | form-data: any product field                     | Update product      |
| DELETE | /:id       | ✅   | —                                                | Delete product      |

### Payment Routes — `/api/payment`

| Method | Endpoint   | Auth | Body                                              | Description         |
|--------|------------|------|---------------------------------------------------|---------------------|
| POST   | /          | ✅   | `amount, currency?, method?, description?`        | Process payment     |
| GET    | /history   | ✅   | —                                                 | My payment history  |
| GET    | /:id       | ✅   | —                                                 | Single payment      |

---

## Authentication

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

Get the token from `/api/auth/register` or `/api/auth/login`.

---

## Image Upload

**Local mode** (default, for development):
- Images saved to `/uploads/`
- Served at `http://localhost:5000/uploads/<filename>`
- Set `UPLOAD_MODE=local` in `.env`

**Cloudinary mode** (for production/hosting):
1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. Set `.env`:
   ```
   UPLOAD_MODE=cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
3. Images auto-compressed and served via CDN URL

---

## Postman Testing

1. Open Postman → Import → select `MERN_Auth_Postman_Collection.json`
2. Go to **Collection Variables** → set `base_url` to `http://localhost:5000`
3. Run requests in order:
   - **Register** → token auto-saved to `{{token}}`
   - **Login** → refreshes token
   - **Add Product** → product_id auto-saved
   - **Get All Products**, **Single Product**, **Update**, **Delete**
   - **Process Payment** → transaction ID saved
   - **Payment History**
4. All requests include **automated tests** — check the "Test Results" tab

---

## Hosting (Render / Railway)

### Render (Free tier)
1. Push to GitHub
2. New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables in Render dashboard (copy from `.env.example`)
6. Use MongoDB Atlas URI for `MONGO_URI`

### MongoDB Atlas (Free)
1. [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. Database Access → create user
3. Network Access → `0.0.0.0/0` (allow all for now)
4. Connect → get connection string → paste in `MONGO_URI`

---

## Improvements Over Lab Manual

| Issue in Lab Manual              | Fixed In This Version                         |
|----------------------------------|-----------------------------------------------|
| Hardcoded `"secretkey"`          | Read from `JWT_SECRET` env variable           |
| No token expiry                  | `JWT_EXPIRES_IN=7d` configurable              |
| Password hashed inline in route  | Pre-save hook in User model                   |
| No input validation              | `express-validator` on all routes             |
| No error handling                | Global error middleware (no crashes)          |
| Single plain `email+password` schema | `name`, `role`, `isActive`, `timestamps`  |
| No image type checking           | File filter: JPEG/PNG/WEBP only, 5MB limit    |
| Local-only uploads               | Cloudinary switch via env variable            |
| No payment records               | Payment stored in MongoDB with history        |
| No pagination                    | Products list: `page` + `limit` + search      |
| No Postman tests                 | 20+ requests with automated test assertions   |
