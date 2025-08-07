# 🚀 Gezsek Travel - Production Deployment Guide

## 🎯 Deployment Architecture

```
┌─────────────────┐    HTTPS/WSS    ┌─────────────────┐    MongoDB    ┌─────────────┐
│   Netlify       │◄───────────────►│   Railway       │◄─────────────►│  Database   │
│   (Frontend)    │                 │   (Backend)     │               │             │
│                 │                 │                 │               │             │
│ • React Build   │   API Calls     │ • Node.js       │   Connection  │ • MongoDB   │
│ • Static Files  │   Socket.IO     │ • Express.js    │   String      │ • Atlas     │
│ • Vite Build    │   JWT Auth      │ • Socket.IO     │               │ • Railway   │
└─────────────────┘                 └─────────────────┘               └─────────────┘
```

## 📦 1. Backend Deployment (Railway)

### Railway Configuration Files

#### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Environment Variables for Railway

```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gezsekk?retryWrites=true&w=majority

# JWT Secret (Generate a strong secret)
JWT_SECRET=your_super_secure_production_jwt_secret_here_at_least_64_characters_long

# Cloudinary (Media Management)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_FROM=noreply@gezsektravel.com
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_app_specific_password

# CORS Origins (Update after Netlify deployment)
CORS_ORIGINS=https://your-netlify-domain.netlify.app,https://gezsektravel.com

# Railway Specific
RAILWAY_STATIC_URL=https://your-railway-domain.railway.app
```

### Health Check Endpoint
Add to `backend/index.js`:
```javascript
// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
```

## 🌐 2. Frontend Deployment (Netlify)

### Build Configuration

#### netlify.toml
```toml
[build]
  base = "frontend/"
  publish = "frontend/dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Environment Variables for Netlify

```env
# API Base URL (Railway backend URL)
VITE_API_URL=https://your-railway-domain.railway.app/api
VITE_SOCKET_URL=https://your-railway-domain.railway.app

# App Configuration
VITE_APP_NAME=Gezsek Travel
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT=true
```

## 🔧 3. Code Modifications for Production

### Backend Modifications

#### Update CORS Configuration
```javascript
// backend/index.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

#### Socket.IO CORS Update
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});
```

### Frontend Modifications

#### Update API Configuration
```javascript
// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export { API_BASE_URL, SOCKET_URL };
```

#### Update Socket.IO Connection
```javascript
// frontend/src/components/common/LiveChat.jsx
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

useEffect(() => {
  const newSocket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    forceNew: true,
    autoConnect: true,
    timeout: 20000
  });
  
  setSocket(newSocket);
  // ... rest of the code
}, []);
```

## 📊 4. Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create MongoDB Atlas cluster
2. Whitelist Railway IP ranges
3. Create database user
4. Get connection string
5. Add to Railway environment variables

### Option 2: Railway PostgreSQL
1. Add PostgreSQL service in Railway
2. Migrate from MongoDB to PostgreSQL
3. Update Mongoose to Sequelize/Prisma

## 🚀 5. Deployment Steps

### Step 1: Prepare Repository
```bash
# Create production branch
git checkout -b production

# Add deployment configuration files
git add .
git commit -m "🚀 Add production deployment configuration"
git push origin production
```

### Step 2: Deploy Backend to Railway
1. Connect Railway to GitHub repository
2. Select backend folder as root
3. Add environment variables
4. Deploy and test

### Step 3: Deploy Frontend to Netlify
1. Connect Netlify to GitHub repository
2. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Add environment variables
4. Deploy and test

### Step 4: Configure Custom Domains
1. **Railway**: Add custom domain for API
2. **Netlify**: Add custom domain for frontend
3. **Update CORS**: Add production domains

## 🔒 6. Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] HTTPS only in production
- [ ] Secure CORS configuration
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages sanitized

## 📈 7. Monitoring & Analytics

### Railway Monitoring
- Application logs
- Performance metrics
- Error tracking
- Uptime monitoring

### Netlify Analytics
- Traffic analytics
- Performance monitoring
- Form submissions
- Function logs

## 🧪 8. Testing Production

### Backend Testing
```bash
# Test API endpoints
curl https://your-railway-domain.railway.app/api/health
curl https://your-railway-domain.railway.app/api/tours

# Test WebSocket connection
wscat -c wss://your-railway-domain.railway.app
```

### Frontend Testing
- Test all user flows
- Test admin panel
- Test real-time chat
- Test responsive design
- Test performance

## 🔄 9. CI/CD Pipeline (Optional)

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        # Railway deployment steps
      - name: Deploy to Netlify
        # Netlify deployment steps
```

## 📞 10. Production URLs

After deployment, update these URLs:
- **Frontend**: https://your-netlify-domain.netlify.app
- **Backend API**: https://your-railway-domain.railway.app/api
- **Admin Panel**: https://your-netlify-domain.netlify.app/admin-panel

## 🆘 11. Troubleshooting

### Common Issues
1. **CORS Errors**: Check origin configuration
2. **Socket.IO Connection**: Verify transport settings
3. **Database Connection**: Check connection string
4. **Build Failures**: Check Node.js versions
5. **Environment Variables**: Verify all variables are set

### Logs Access
- **Railway**: Dashboard → Deployments → Logs
- **Netlify**: Dashboard → Deploys → Function logs

---

**Ready for production deployment! 🚀**