# 🚀 Setup & Development Guide - CheckInn OTA

## 🔧 Yêu Cầu Hệ Thống

### Software Requirements

- **Node.js**: v18.0.0 hoặc cao hơn
- **npm**: v8.0.0 hoặc cao hơn
- **MongoDB**: v5.0.0 hoặc cao hơn
- **Git**: v2.30.0 hoặc cao hơn

### Recommended Tools

- **Code Editor**: VS Code với extensions
- **API Testing**: Postman hoặc Insomnia
- **Database GUI**: MongoDB Compass
- **Terminal**: PowerShell (Windows) hoặc Terminal (macOS/Linux)

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/checkinn/checkinn-ota.git
cd checkinn-ota
```

### 2. Install Dependencies

#### Backend Dependencies

```bash
# Install server dependencies
npm install
```

#### Frontend Dependencies

```bash
# Navigate to client folder
cd client

# Install client dependencies
npm install

# Go back to root
cd ..
```

### 3. Environment Setup

#### Create Backend .env File

```bash
# Root directory (.env)
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/checkinn
MONGODB_TEST_URI=mongodb://localhost:27017/checkinn_test

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL
CLIENT_URL=http://localhost:3000

# Payment Gateways (Optional)
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
```

#### Create Frontend .env File

```bash
# Client directory (client/.env)
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_BASE_URL=http://localhost:3000

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Facebook OAuth
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id

# Maps & Location
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Analytics
REACT_APP_GA_TRACKING_ID=your-google-analytics-id

# Environment
REACT_APP_ENV=development
```

---

## 🗄️ Database Setup

### 1. Install MongoDB

#### Windows (MongoDB Community)

```bash
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey
choco install mongodb

# Start MongoDB service
net start MongoDB
```

#### macOS (Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Debian

```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Database Initialization

```bash
# Connect to MongoDB
mongosh

# Create database and user
use checkinn
db.createUser({
  user: "checkinn_user",
  pwd: "your_password",
  roles: ["readWrite"]
})

# Exit MongoDB shell
exit
```

### 3. Seed Database (Optional)

```bash
# Run database seeding script
npm run seed

# Or manually seed test data
node scripts/seedDatabase.js
```

---

## ⚡ Development

### 1. Start Development Servers

#### Method 1: Concurrently (Recommended)

```bash
# Start both frontend and backend
npm run dev
```

#### Method 2: Separate Terminals

```bash
# Terminal 1: Backend server
npm run server

# Terminal 2: Frontend client
cd client
npm start
```

### 2. Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api-docs

### 3. Hot Reload

- **Frontend**: Vite hot reload enabled
- **Backend**: Nodemon restart on file changes
- **Database**: MongoDB compass for real-time monitoring

---

## 🛠️ Available Scripts

### Root Directory Scripts

```bash
# Development
npm run dev              # Start both frontend & backend
npm run server           # Start backend only
npm run client           # Start frontend only

# Database
npm run seed             # Seed database with sample data
npm run db:reset         # Reset database
npm run db:backup        # Backup database

# Testing
npm run test             # Run all tests
npm run test:server      # Backend tests only
npm run test:client      # Frontend tests only
npm run test:e2e         # End-to-end tests

# Production
npm run build            # Build for production
npm run start            # Start production server
npm run pm2:start        # Start with PM2

# Utilities
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting
npm run analyze          # Bundle analysis
```

### Frontend Scripts (client/)

```bash
# Development
npm start                # Start dev server
npm run dev              # Alias for start

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Jest tests
npm run test:watch       # Watch mode tests
npm run test:coverage    # Coverage report

# Analysis
npm run analyze          # Bundle size analysis
npm run lighthouse       # Performance audit
```

---

## 🔧 VS Code Setup

### Recommended Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "mongodb.mongodb-vscode",
    "ms-vscode.powershell",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Workspace Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "html"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  }
}
```

### Debug Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Launch Client",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/client",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    }
  ]
}
```

---

## 🧪 Testing Setup

### Backend Testing

```bash
# Install testing dependencies
npm install --save-dev jest supertest mongodb-memory-server

# Create test database
export NODE_ENV=test
npm run test
```

### Frontend Testing

```bash
cd client

# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run tests
npm test
```

### E2E Testing with Cypress

```bash
cd client

# Install Cypress
npm install --save-dev cypress

# Open Cypress
npx cypress open

# Run E2E tests
npm run test:e2e
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

```bash
# Check MongoDB status
mongosh --eval "db.runCommand({connectionStatus: 1})"

# Restart MongoDB
# Windows
net stop MongoDB
net start MongoDB

# macOS
brew services restart mongodb/brew/mongodb-community

# Linux
sudo systemctl restart mongod
```

#### 2. Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5001    # Windows
lsof -ti :5001                  # macOS/Linux

# Kill process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                   # macOS/Linux
```

#### 3. NPM Package Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Environment Variables Not Loading

```bash
# Check .env file exists
ls -la | grep .env

# Verify environment variables
node -e "console.log(process.env.NODE_ENV)"

# Restart development server
npm run dev
```

### Performance Issues

#### 1. Slow Build Times

```bash
# Clear Vite cache
cd client
rm -rf node_modules/.vite
npm run dev
```

#### 2. Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

---

## 📊 Monitoring & Logs

### Development Logging

```bash
# View server logs
tail -f logs/combined.log

# View error logs only
tail -f logs/error.log

# Real-time server monitoring
npm run dev:verbose
```

### Database Monitoring

```bash
# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Connection monitoring
mongosh --eval "db.runCommand({serverStatus: 1}).connections"
```

---

## 🚀 Production Deployment

### Build for Production

```bash
# Build frontend
cd client
npm run build

# Build backend (if using TypeScript)
cd ..
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs checkinn
```

---

## 🔐 Security Checklist

### Development Security

- [ ] Environment variables not committed to git
- [ ] Database credentials secured
- [ ] API keys stored safely
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation implemented

### Production Security

- [ ] HTTPS certificates configured
- [ ] Firewall rules applied
- [ ] Database access restricted
- [ ] Monitoring and alerts setup
- [ ] Backup strategy implemented
- [ ] Security headers configured

---

## 📚 Additional Resources

### Documentation Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Community & Support

- **Slack**: checkinn-dev.slack.com
- **Email**: dev@checkinn.vn
- **GitHub Issues**: github.com/checkinn/checkinn-ota/issues
- **Wiki**: github.com/checkinn/checkinn-ota/wiki

---

_Last Updated: September 22, 2025_  
_Version: 1.0.0_
