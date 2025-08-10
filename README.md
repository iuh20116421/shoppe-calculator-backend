# Shopee Calculator Backend API

Backend API cho ứng dụng tính toán giá Shopee với tính năng xác thực người dùng.

## 🚀 Tính năng

- ✅ JWT Authentication
- ✅ User Registration/Login
- ✅ Password Hashing (bcrypt)
- ✅ MongoDB Integration
- ✅ Swagger API Documentation
- ✅ CORS enabled
- ✅ Error Handling
- ✅ Protected Routes

## 📋 Yêu cầu hệ thống

- Node.js (v14 hoặc cao hơn)
- MongoDB (Local hoặc MongoDB Atlas)
- NPM hoặc Yarn

## 🛠️ Cài đặt

### 1. Clone repository
```bash
cd backend-shoppe-calculator
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Tạo file .env
Tạo file `.env` trong thư mục gốc với nội dung:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopee-calculator
JWT_SECRET=your_jwt_secret_key_here_please_change_in_production
DB_NAME=shopee-calculator
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Cài đặt MongoDB
- **Local**: Tải và cài đặt MongoDB Community Server
- **Cloud**: Sử dụng MongoDB Atlas (miễn phí)

## 🚀 Chạy ứng dụng

### Development mode (với nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📖 API Documentation

Sau khi khởi động server, truy cập Swagger documentation tại:
```
http://localhost:5000/api-docs
```

## 🔗 API Endpoints

### Authentication
- **POST** `/api/auth/register` - Đăng ký user mới
- **POST** `/api/auth/login` - Đăng nhập
- **GET** `/api/auth/profile` - Lấy thông tin user (Protected)

### System
- **GET** `/api/health` - Health check

## 📝 Cách sử dụng API

### 1. Đăng ký User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "phone": "0123456789",
  "password": "password123",
  "shopLink": "https://shopee.vn/shop/123456"
}
```

### 2. Đăng nhập
```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "0123456789",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a7b8c9d1e2f3g4h5i6j7k8",
    "name": "Nguyen Van A",
    "phone": "0123456789",
    "shopLink": "https://shopee.vn/shop/123456"
  }
}
```

### 3. Lấy thông tin User (Protected)
```bash
GET /api/auth/profile
x-auth-token: YOUR_JWT_TOKEN
# Hoặc
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔐 Authentication

API sử dụng JWT (JSON Web Token) cho xác thực. Có 2 cách gửi token:

1. **Header x-auth-token:**
```
x-auth-token: YOUR_JWT_TOKEN
```

2. **Authorization Bearer:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📁 Cấu trúc dự án

```
backend-shoppe-calculator/
├── .env                           # Environment variables
├── .gitignore                     # Git ignore
├── package.json                   # NPM configuration
├── README.md                      # Documentation
└── src/
    ├── config/
    │   ├── db.js                 # MongoDB connection
    │   └── swagger.js            # Swagger configuration
    ├── controllers/
    │   └── authController.js     # Authentication logic
    ├── middleware/
    │   └── authMiddleware.js     # JWT middleware
    ├── models/
    │   └── userModel.js         # User schema
    ├── routes/
    │   └── authRoutes.js        # API routes
    └── server.js                # Entry point
```

## 🛠️ Scripts

```bash
npm start          # Chạy production mode
npm run dev        # Chạy development mode với nodemon
npm run server     # Alias cho npm run dev
```

## 🐛 Troubleshooting

### 1. Lỗi kết nối MongoDB
- Kiểm tra MongoDB service đã chạy chưa
- Kiểm tra MONGO_URI trong file .env
- Nếu dùng MongoDB Atlas, kiểm tra network access

### 2. Lỗi JWT
- Kiểm tra JWT_SECRET trong file .env
- Đảm bảo token được gửi đúng format

### 3. Lỗi CORS
- Kiểm tra CLIENT_URL trong file .env
- Đảm bảo frontend URL đúng

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên repository.

## 📄 License

MIT License
