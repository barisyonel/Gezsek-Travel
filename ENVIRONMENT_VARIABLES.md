# 🔐 Environment Variables Configuration

## 🚀 Railway (Backend) Environment Variables

```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gezsekk?retryWrites=true&w=majority

# JWT Configuration (Generate a strong secret - at least 64 characters)
JWT_SECRET=your_super_secure_production_jwt_secret_here_minimum_64_characters_long_random_string

# CORS Origins (Update after Netlify deployment)
CORS_ORIGINS=https://your-netlify-domain.netlify.app,https://gezsektravel.com

# Cloudinary Configuration (Media Management)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_FROM=noreply@gezsektravel.com
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_gmail_app_specific_password

# Railway Specific
RAILWAY_STATIC_URL=https://your-railway-domain.railway.app
```

## 🌐 Netlify (Frontend) Environment Variables

```env
# API Configuration (Update with Railway URL after deployment)
VITE_API_URL=https://your-railway-domain.railway.app/api
VITE_SOCKET_URL=https://your-railway-domain.railway.app

# App Configuration
VITE_APP_NAME=Gezsek Travel
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true

# Production Settings
VITE_DEBUG_MODE=false
```

## 🔑 How to Generate Secure JWT Secret

### Option 1: Node.js
```javascript
// Run this in Node.js console
require('crypto').randomBytes(64).toString('hex')
```

### Option 2: OpenSSL
```bash
openssl rand -hex 64
```

### Option 3: Online Generator
Use a secure random string generator (minimum 64 characters)

## 📧 Gmail App Password Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings
3. Security → 2-Step Verification → App passwords
4. Generate app password for "Mail"
5. Use this password in `EMAIL_PASS`

## 🗄️ MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Database Access → Add Database User
4. Network Access → Add IP Address (0.0.0.0/0 for Railway)
5. Get connection string
6. Replace `<password>` with your database user password

## ☁️ Cloudinary Setup

1. Create Cloudinary account
2. Dashboard → Account Details
3. Copy Cloud Name, API Key, API Secret
4. Add to environment variables

## 🔧 Railway Deployment Steps

1. **Connect Repository**:
   - Go to Railway dashboard
   - New Project → Deploy from GitHub repo
   - Select your repository

2. **Configure Build**:
   - Root directory: `/` (or leave empty)
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`

3. **Add Environment Variables**:
   - Go to Variables tab
   - Add all backend environment variables

4. **Custom Domain** (Optional):
   - Settings → Domains
   - Add custom domain

## 🌐 Netlify Deployment Steps

1. **Connect Repository**:
   - Go to Netlify dashboard
   - New site from Git
   - Select your repository

2. **Build Settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Environment Variables**:
   - Site settings → Environment variables
   - Add all frontend environment variables

4. **Custom Domain** (Optional):
   - Domain settings → Add custom domain

## 🔄 Update Process After Deployment

### Step 1: Deploy Backend to Railway
1. Deploy backend first
2. Note the Railway domain (e.g., `https://abc123.railway.app`)

### Step 2: Update Frontend Environment Variables
1. Update `VITE_API_URL` with Railway domain + `/api`
2. Update `VITE_SOCKET_URL` with Railway domain
3. Redeploy frontend

### Step 3: Update Backend CORS
1. Update `CORS_ORIGINS` with Netlify domain
2. Redeploy backend

## 🧪 Testing Environment Variables

### Backend Health Check
```bash
curl https://your-railway-domain.railway.app/api/health
```

### Frontend API Connection
```javascript
// Browser console
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_SOCKET_URL)
```

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong, unique secrets**
3. **Rotate secrets regularly**
4. **Limit CORS origins to specific domains**
5. **Use HTTPS only in production**
6. **Monitor environment variable access**

## 🚨 Emergency Recovery

### If JWT Secret is Compromised:
1. Generate new JWT secret
2. Update Railway environment variable
3. All users will need to log in again

### If Database is Compromised:
1. Change database password
2. Update connection string
3. Redeploy backend

### If API Keys are Compromised:
1. Regenerate API keys in respective services
2. Update environment variables
3. Redeploy applications

---

**Keep your environment variables secure! 🔐**