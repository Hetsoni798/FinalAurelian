# AURELIAN — Full Stack Fashion App
> JWT Authentication · Image Upload · Mock Payment API · Postman Tests · Live on Vercel

🔗 **Live:** https://final-aurelian.vercel.app/

---

## Project Structure

```
AURELIAN-main/
├── index.html                        ← Frontend homepage
├── style.css                         ← Main styles
├── script.js                         ← Cart, filters, scroll effects
├── login.html                        ← Login page
├── login-Styles.css                  ← Login styles
├── login-scripts.js                  ← Login form handler
├── MERN_Auth_Postman_Collection.json ← API test suite
│
└── mern-auth/                        ← Backend (Node.js + Express)
    ├── server.js
    ├── package.json
    ├── .env
    ├── config/
    │   ├── db.js
    │   └── cloudinary.js
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   └── Payment.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   └── paymentRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── errorMiddleware.js
    │   └── validate.js
    └── uploads/
```

---

## Features

| Feature | Details |
|---------|---------|
| 🔐 JWT Authentication | Register, Login, protected routes, token expiry |
| 🔒 Password Hashing | bcrypt pre-save hook, never stored plain |
| 📦 Product CRUD | Create, Read, Update, Delete with ownership check |
| 🖼️ Image Upload | Multer — local disk (dev) or Cloudinary (production) |
| 💳 Mock Payment API | Transaction records, history, receipt with gateway ref |
| ✅ Input Validation | express-validator on all routes, clear error messages |
| 🛡️ Error Handling | Global error middleware, no server crashes |
| 📄 Pagination | Products list with page, limit, search, category filter |
| 🧪 Postman Tests | 20+ requests with automated assertions |
| 🌐 Hosted | Live on Vercel + MongoDB Atlas |

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint  | Auth | Description |
|--------|-----------|------|-------------|
| POST | /register | — | Register new user |
| POST | /login | — | Login → JWT token |
| GET | /me | 🔒 | Get own profile |
| PATCH | /me | 🔒 | Update profile |

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | 🔒 | Create product + image |
| GET | / | — | List (page, limit, search, category) |
| GET | /:id | — | Single product |
| PUT | /:id | 🔒 | Update (owner only) |
| DELETE | /:id | 🔒 | Delete (owner only) |

### Payment — `/api/payment`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | 🔒 | Process payment |
| GET | /history | 🔒 | My transactions |
| GET | /:id | 🔒 | Single transaction |

---

## Authentication

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

## Local Setup

```bash
cd mern-auth
npm install
# create .env from .env.example and fill values
node server.js
```

---

## Postman Testing

1. Import `MERN_Auth_Postman_Collection.json`
2. Set `base_url` → `https://final-aurelian.vercel.app`
3. Run in order:

```
Register → Login → Add Product → Get Products → Payment
```

All requests have automated test assertions in the Tests tab ✅

---

## Tech Stack

**Frontend:** HTML · CSS · Vanilla JS · Google Fonts

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcrypt · Multer · Cloudinary · express-validator

**Hosting:** Vercel · MongoDB Atlas

---

## Made By

**Het Soni** — B.Sc. (Hons) Computer Science  
Unitedworld Institute of Technology, Gandhinagar  
GitHub: [hetsoni798](https://github.com/hetsoni798)  
LinkedIn: [het-soni-0a6040224](https://linkedin.com/in/het-soni-0a6040224)
