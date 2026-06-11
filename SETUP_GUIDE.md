# Alumni Networking Portal - Setup Guide

## Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: Local instance or MongoDB Atlas connection
- **npm** or **yarn**: Package manager

## Environment Setup

### 1. Backend Configuration

Create/update `server/.env` file with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumni_portal
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production_use_strong_random_string
NODE_ENV=development
```

**Important**: In production, change:
- `JWT_SECRET` to a strong, random string (minimum 32 characters)
- `MONGODB_URI` to your production MongoDB connection string
- `NODE_ENV` to `production`

### 2. Frontend Configuration

The frontend .env files are already created:
- `client/.env` - for development
- `client/.env.local` - for local overrides

Default configuration:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. MongoDB Setup

#### Option A: Local MongoDB

```bash
# Start MongoDB (Windows)
mongod

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and user
3. Update `server/.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni_portal
   ```

## Installation

### 1. Install Root Dependencies

```bash
npm run install-all
```

This installs dependencies for:
- Root project
- Server (`server/`)
- Client (`client/`)

### 2. Individual Installation (if needed)

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Database Initialization

### Initialize Database with Sample Data

```bash
# From the server directory
cd server
node scripts/initDatabase.js
```

This creates:
- Default admin user
- Sample student users
- Sample alumni users

**Default Admin Credentials:**
- Email: `admin@mohit.com`
- Password: `admin123`

**Sample Student Credentials:**
- Email: `student@alumniportal.com`
- Password: `student123`

## Running the Application

### Development Mode

From the root directory:

```bash
npm run dev
```

This starts both:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`

### Individual Services

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run client
```

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start backend in production
cd ../server
NODE_ENV=production npm start
```

## Accessing the Application

### URLs

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`

### Login Portal

1. Go to `http://localhost:3000/login`
2. Select login type:
   - **Student Login** → `http://localhost:3000/login/student`
   - **Alumni Login** → `http://localhost:3000/login/alumni`
   - **Admin Login** → `http://localhost:3000/login/admin`

### Default Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mohit.com | admin123 |
| Student | student@alumniportal.com | student123 |
| Student 2 | student2@alumniportal.com | student123 |

## Project Structure

```
alumni-networking-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   ├── package.json
│   └── .env               # Frontend environment config
├── server/                # Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── scripts/          # Utility scripts
│   ├── package.json
│   └── .env              # Backend environment config
└── package.json          # Root package.json
```

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseError: Cannot connect to MongoDB`

**Solution**:
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `server/.env`
3. If using MongoDB Atlas, verify:
   - Network access allows your IP
   - Connection string is correct
   - Username and password are correct

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use a different port
# Update PORT in server/.env
```

### Frontend Cannot Connect to API

**Error**: `Failed to fetch /api/...`

**Solution**:
1. Check backend is running on port 5000
2. Verify `REACT_APP_API_URL` in `client/.env`
3. Check CORS configuration in `server/server.js`

### Missing Dependencies

**Error**: `Cannot find module 'xxx'`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm run install-all
```

## Security Recommendations for Production

1. **Change JWT Secret**: Update `JWT_SECRET` in `server/.env` to a strong random string
2. **Database**: Use MongoDB Atlas with network restrictions
3. **CORS**: Update CORS origin in `server/server.js` to your production domain
4. **HTTPS**: Deploy with HTTPS/TLS
5. **Environment Variables**: Never commit `.env` files
6. **Dependencies**: Regularly update dependencies with `npm audit`

## Next Steps

1. Run the application following "Running the Application" section
2. Test with default accounts
3. Create new user accounts
4. Explore features on each role's dashboard

For detailed feature documentation, see [README.md](README.md)
