# 📡 Gezsek Travel API Documentation

## Base URL
```
Development: http://localhost:5001/api
Production: https://api.gezsektravel.com/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this standard format:

### Success Response
```json
{
  "message": "Success message",
  "data": {}, // Response data
  "timestamp": "2025-08-07T15:30:00.000Z"
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Error details",
  "timestamp": "2025-08-07T15:30:00.000Z"
}
```

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

# 🔐 Authentication Endpoints

## Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "5551234567",
  "birthDate": "1990-01-15",
  "gender": "erkek" // or "kadın"
}
```

**Response:**
```json
{
  "message": "Kayıt başarılı! Hoş geldiniz.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "5551234567",
    "birthDate": "1990-01-15T00:00:00.000Z",
    "gender": "erkek",
    "verified": true,
    "isAdmin": false
  }
}
```

## Login User
Authenticate user and get access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Giriş başarılı",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "isAdmin": false
  }
}
```

## Get User Profile
Get current user's profile information.

**Endpoint:** `GET /auth/profile`
**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "5551234567",
    "birthDate": "1990-01-15T00:00:00.000Z",
    "gender": "erkek",
    "verified": true,
    "isAdmin": false
  }
}
```

---

# 🎫 Tour Endpoints

## Get All Tours
Retrieve all available tours with optional filtering.

**Endpoint:** `GET /tours`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Example:** `GET /tours?page=1&limit=10&category=adventure&minPrice=100`

**Response:**
```json
{
  "tours": [
    {
      "id": "tour_id",
      "title": "Kapadokya Balon Turu",
      "description": "Muhteşem Kapadokya manzarası...",
      "price": 299,
      "duration": "2 gün 1 gece",
      "location": "Kapadokya",
      "category": "adventure",
      "images": ["image1.jpg", "image2.jpg"],
      "rating": 4.8,
      "reviewCount": 156,
      "isActive": true,
      "createdAt": "2025-08-07T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Get Tour by ID
Retrieve detailed information about a specific tour.

**Endpoint:** `GET /tours/:id`

**Response:**
```json
{
  "tour": {
    "id": "tour_id",
    "title": "Kapadokya Balon Turu",
    "description": "Detaylı açıklama...",
    "price": 299,
    "duration": "2 gün 1 gece",
    "location": "Kapadokya",
    "category": "adventure",
    "images": ["image1.jpg", "image2.jpg"],
    "itinerary": [
      {
        "day": 1,
        "title": "Varış ve Otel",
        "description": "Kapadokya'ya varış..."
      }
    ],
    "included": ["Kahvaltı", "Rehber", "Ulaşım"],
    "excluded": ["Öğle yemeği", "Kişisel harcamalar"],
    "rating": 4.8,
    "reviewCount": 156,
    "reviews": [...],
    "isActive": true
  }
}
```

## Create Tour (Admin Only)
Create a new tour.

**Endpoint:** `POST /tours`
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Yeni Tur",
  "description": "Tur açıklaması",
  "price": 199,
  "duration": "1 gün",
  "location": "İstanbul",
  "category": "cultural",
  "images": ["image1.jpg"],
  "itinerary": [...],
  "included": [...],
  "excluded": [...]
}
```

## Update Tour (Admin Only)
Update an existing tour.

**Endpoint:** `PUT /tours/:id`
**Authentication:** Required (Admin)

**Request Body:** Same as create tour

## Delete Tour (Admin Only)
Delete a tour.

**Endpoint:** `DELETE /tours/:id`
**Authentication:** Required (Admin)

---

# 💬 Message Endpoints

## Get User Conversations
Get current user's conversation with admin.

**Endpoint:** `GET /messages/conversation`
**Authentication:** Required

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "content": "Merhaba, yardıma ihtiyacım var",
      "messageType": "text",
      "isFromUser": true,
      "isFromAdmin": false,
      "status": "read",
      "createdAt": "2025-08-07T15:30:00.000Z",
      "sender": {
        "id": "user_id",
        "name": "John Doe"
      },
      "receiver": {
        "id": "admin_id",
        "name": "Admin User"
      }
    }
  ],
  "conversationId": "conv_user_admin"
}
```

## Send Message
Send a message to admin.

**Endpoint:** `POST /messages/send`
**Authentication:** Required

**Request Body:**
```json
{
  "content": "Mesaj içeriği",
  "messageType": "text" // or "image", "file"
}
```

**Response:**
```json
{
  "message": "Mesaj başarıyla gönderildi",
  "data": {
    "id": "message_id",
    "content": "Mesaj içeriği",
    "messageType": "text",
    "status": "sent",
    "createdAt": "2025-08-07T15:30:00.000Z"
  }
}
```

## Mark Messages as Read
Mark messages as read.

**Endpoint:** `PUT /messages/mark-as-read`
**Authentication:** Required

**Request Body:**
```json
{
  "messageIds": ["message_id1", "message_id2"]
}
```

---

# 👑 Admin Endpoints

## Get All Conversations (Admin Only)
Get all user conversations for admin panel.

**Endpoint:** `GET /messages/admin/conversations`
**Authentication:** Required (Admin)

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv_id",
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "user@example.com"
      },
      "lastMessage": {
        "content": "Son mesaj içeriği",
        "createdAt": "2025-08-07T15:30:00.000Z"
      },
      "messageCount": 5,
      "unreadCount": 2
    }
  ]
}
```

## Get Conversation with User (Admin Only)
Get messages between admin and specific user.

**Endpoint:** `GET /messages/admin/conversation/:userId`
**Authentication:** Required (Admin)

**Response:**
```json
{
  "messages": [...],
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "conversationId": "conv_admin_user"
}
```

## Send Message to User (Admin Only)
Send a message to a specific user.

**Endpoint:** `POST /messages/admin/send`
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "userId": "user_id",
  "content": "Admin mesajı",
  "messageType": "text"
}
```

## Get System Statistics (Admin Only)
Get system usage statistics.

**Endpoint:** `GET /admin/statistics`
**Authentication:** Required (Admin)

**Response:**
```json
{
  "statistics": {
    "totalUsers": 150,
    "totalTours": 25,
    "totalReservations": 89,
    "totalRevenue": 15750,
    "newUsersThisMonth": 23,
    "popularTours": [...],
    "recentActivity": [...]
  }
}
```

## Get All Users (Admin Only)
Get all registered users.

**Endpoint:** `GET /admin/users`
**Authentication:** Required (Admin)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or email

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "5551234567",
      "verified": true,
      "isAdmin": false,
      "createdAt": "2025-08-07T10:00:00.000Z",
      "lastLogin": "2025-08-07T15:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

## Update User (Admin Only)
Update user information.

**Endpoint:** `PUT /admin/users/:id`
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "verified": true,
  "isAdmin": false
}
```

## Delete User (Admin Only)
Delete a user account.

**Endpoint:** `DELETE /admin/users/:id`
**Authentication:** Required (Admin)

---

# 📝 Blog Endpoints

## Get All Blog Posts
Retrieve all published blog posts.

**Endpoint:** `GET /blog`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category

**Response:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "title": "Blog Başlığı",
      "content": "Blog içeriği...",
      "excerpt": "Kısa özet...",
      "author": "Admin User",
      "category": "travel-tips",
      "tags": ["seyahat", "ipucu"],
      "featured": true,
      "published": true,
      "createdAt": "2025-08-07T10:00:00.000Z",
      "featuredImage": "blog-image.jpg"
    }
  ],
  "pagination": {...}
}
```

## Get Blog Post by ID
Get detailed blog post information.

**Endpoint:** `GET /blog/:id`

**Response:**
```json
{
  "post": {
    "id": "post_id",
    "title": "Blog Başlığı",
    "content": "Tam blog içeriği...",
    "author": "Admin User",
    "category": "travel-tips",
    "tags": ["seyahat", "ipucu"],
    "published": true,
    "createdAt": "2025-08-07T10:00:00.000Z",
    "updatedAt": "2025-08-07T12:00:00.000Z",
    "featuredImage": "blog-image.jpg",
    "readTime": 5
  }
}
```

## Create Blog Post (Admin Only)
Create a new blog post.

**Endpoint:** `POST /blog`
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Yeni Blog Yazısı",
  "content": "Blog içeriği...",
  "excerpt": "Kısa özet...",
  "category": "travel-tips",
  "tags": ["seyahat", "ipucu"],
  "featured": false,
  "published": true,
  "featuredImage": "image.jpg"
}
```

---

# 🔔 Notification Endpoints

## Get User Notifications
Get current user's notifications.

**Endpoint:** `GET /notifications`
**Authentication:** Required

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification_id",
      "title": "Rezervasyon Onayı",
      "message": "Kapadokya turu rezervasyonunuz onaylandı",
      "type": "reservation",
      "read": false,
      "createdAt": "2025-08-07T15:30:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

## Mark Notification as Read
Mark specific notification as read.

**Endpoint:** `PUT /notifications/:id/read`
**Authentication:** Required

## Send Bulk Notification (Admin Only)
Send notification to multiple users.

**Endpoint:** `POST /admin/notifications/bulk`
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "Sistem Bildirimi",
  "message": "Sistem bakımı yapılacaktır",
  "type": "system",
  "userIds": ["user1", "user2"], // optional, if empty sends to all
  "scheduled": "2025-08-07T20:00:00.000Z" // optional
}
```

---

# 📊 Analytics Endpoints

## Get User Analytics (Admin Only)
Get user behavior analytics.

**Endpoint:** `GET /analytics/users`
**Authentication:** Required (Admin)

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics

**Response:**
```json
{
  "analytics": {
    "totalUsers": 150,
    "newUsers": 23,
    "activeUsers": 89,
    "userGrowth": [
      {
        "date": "2025-08-01",
        "count": 10
      }
    ],
    "topLocations": [
      {
        "country": "Turkey",
        "count": 120
      }
    ]
  }
}
```

## Get Tour Analytics (Admin Only)
Get tour performance analytics.

**Endpoint:** `GET /analytics/tours`
**Authentication:** Required (Admin)

**Response:**
```json
{
  "analytics": {
    "totalViews": 1250,
    "totalBookings": 89,
    "conversionRate": 7.1,
    "popularTours": [
      {
        "tourId": "tour_id",
        "title": "Kapadokya Turu",
        "views": 456,
        "bookings": 23
      }
    ],
    "revenueByMonth": [...]
  }
}
```

---

# 🔍 Search Endpoints

## Search Tours
Advanced tour search with multiple filters.

**Endpoint:** `GET /search/tours`

**Query Parameters:**
- `q` (optional): Search query
- `category` (optional): Category filter
- `location` (optional): Location filter
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `duration` (optional): Duration filter
- `rating` (optional): Minimum rating
- `sortBy` (optional): Sort field (price, rating, date)
- `sortOrder` (optional): asc or desc

**Example:** `GET /search/tours?q=kapadokya&minPrice=100&maxPrice=500&sortBy=price&sortOrder=asc`

**Response:**
```json
{
  "tours": [...],
  "filters": {
    "categories": ["adventure", "cultural", "nature"],
    "locations": ["Kapadokya", "İstanbul", "Antalya"],
    "priceRange": {
      "min": 50,
      "max": 1000
    }
  },
  "pagination": {...},
  "totalResults": 25
}
```

## Search Suggestions
Get search suggestions as user types.

**Endpoint:** `GET /search/suggestions`

**Query Parameters:**
- `q`: Search query (minimum 2 characters)

**Response:**
```json
{
  "suggestions": [
    {
      "type": "tour",
      "title": "Kapadokya Balon Turu",
      "id": "tour_id"
    },
    {
      "type": "location",
      "title": "Kapadokya",
      "count": 5
    }
  ]
}
```

---

# 📁 File Upload Endpoints

## Upload Image
Upload image files (tours, blog, profile).

**Endpoint:** `POST /upload/image`
**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: Image file (max 5MB)
- `type`: Upload type (tour, blog, profile, etc.)

**Response:**
```json
{
  "message": "Dosya başarıyla yüklendi",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "gezsekk/tours/image123",
    "originalName": "tour-image.jpg",
    "size": 1024000,
    "format": "jpg"
  }
}
```

## Delete Image
Delete uploaded image.

**Endpoint:** `DELETE /upload/image/:publicId`
**Authentication:** Required (Admin)

---

# 🌐 Multi-language Endpoints

## Get Available Languages
Get list of supported languages.

**Endpoint:** `GET /languages`

**Response:**
```json
{
  "languages": [
    {
      "code": "tr",
      "name": "Türkçe",
      "nativeName": "Türkçe",
      "flag": "🇹🇷",
      "isDefault": true
    },
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "flag": "🇺🇸",
      "isDefault": false
    }
  ]
}
```

## Get Translations
Get translations for specific language.

**Endpoint:** `GET /languages/:code/translations`

**Response:**
```json
{
  "translations": {
    "common": {
      "save": "Kaydet",
      "cancel": "İptal",
      "delete": "Sil"
    },
    "tours": {
      "book_now": "Hemen Rezervasyon Yap",
      "duration": "Süre"
    }
  }
}
```

---

# 📞 WebSocket Events

## Socket.IO Events

### Client to Server Events

#### `send_message`
Send a message in chat.
```javascript
socket.emit('send_message', {
  content: 'Mesaj içeriği',
  receiverId: 'admin_id' // optional for user->admin
});
```

#### `typing`
Indicate typing status.
```javascript
socket.emit('typing', {
  isTyping: true,
  userId: 'user_id' // for admin->user
});
```

#### `mark_as_read`
Mark messages as read.
```javascript
socket.emit('mark_as_read', {
  messageIds: ['msg1', 'msg2']
});
```

### Server to Client Events

#### `new_message`
Receive new message.
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
});
```

#### `message_sent`
Confirmation that message was sent.
```javascript
socket.on('message_sent', (data) => {
  console.log('Message sent:', data.message);
});
```

#### `message_error`
Error in message sending.
```javascript
socket.on('message_error', (data) => {
  console.error('Message error:', data.message);
});
```

#### `user_online` / `user_offline`
User status changes (admin only).
```javascript
socket.on('user_online', (data) => {
  console.log('User online:', data.userId);
});
```

#### `admin_typing`
Admin typing indicator (user only).
```javascript
socket.on('admin_typing', (data) => {
  console.log('Admin typing:', data.isTyping);
});
```

---

# 🔧 Error Handling

## Common Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

### Authentication Error (401)
```json
{
  "message": "Yetkisiz. Token yok."
}
```

### Authorization Error (403)
```json
{
  "message": "Bu işlem için yetkiniz yok"
}
```

### Not Found Error (404)
```json
{
  "message": "Kaynak bulunamadı"
}
```

### Server Error (500)
```json
{
  "message": "Sunucu hatası",
  "error": "Internal server error details"
}
```

---

# 📋 Rate Limiting

## Current Limits
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **File Upload**: 10 uploads per hour per user
- **Chat Messages**: 60 messages per minute per user

## Headers
Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

---

# 🔒 Security

## Authentication Flow
1. User registers/logs in with credentials
2. Server validates and returns JWT token
3. Client includes token in Authorization header
4. Server validates token on each request

## Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Expiration
- **Access Token**: 7 days
- **Refresh Token**: 30 days (planned feature)

## Security Headers
All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

# 📊 Monitoring

## Health Check
Check API health status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-07T15:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "development"
}
```

---

This documentation covers all major API endpoints. For more detailed information about specific features, please refer to the source code or contact the development team.