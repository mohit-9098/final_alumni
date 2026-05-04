# Alumni Networking Portal

A comprehensive MERN stack alumni networking portal that connects students, alumni, and administrators in a unified platform.

## Features

### Student Dashboard
- Browse alumni directory and connect with professionals
- View and apply for job opportunities posted by alumni
- Access university MOUs and partnership information
- Receive notifications about events and opportunities
- Message alumni for career guidance and networking

### Alumni Dashboard
- Connect with current students and fellow alumni
- Post job opportunities for students and alumni
- View university MOUs and partnership information
- Send and receive messages from students
- Participate in alumni events and networking

### Admin Dashboard
- Manage students, alumni, and admin accounts
- Oversee job postings and applications
- Create and manage university MOUs
- Post events and notices for all users
- View analytics and system reports

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Lucide React (Icons)
- React Hook Form
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- CORS
- Express Validator
- Multer (for file uploads)

## Project Structure

```
alumni-networking-portal/
|-- client/                 # React frontend
|   |-- public/
|   |-- src/
|   |   |-- components/     # Reusable components
|   |   |-- contexts/       # React contexts (Auth, Notifications)
|   |   |-- pages/          # Page components
|   |   |   |-- auth/       # Login pages
|   |   |   |-- dashboard/  # Dashboard pages
|   |   |   |-- admin/      # Admin pages
|   |   |   |-- alumni/     # Alumni pages
|   |   |   |-- jobs/       # Job pages
|   |   |   |-- mou/        # MOU pages
|   |   |   |-- events/     # Event pages
|   |   |   |-- notices/    # Notice pages
|   |   |   |-- messages/   # Message pages
|   |   |   |-- profile/    # Profile pages
|   |   |   |-- error/      # Error pages
|   |   |-- App.js          # Main App component
|   |   |-- index.js        # Entry point
|   |   |-- index.css       # Global styles
|   |-- package.json
|   |-- tailwind.config.js
|-- server/                 # Express backend
|   |-- models/             # MongoDB models
|   |   |-- User.js
|   |   |-- Job.js
|   |   |-- MOU.js
|   |   |-- Event.js
|   |   |-- Notice.js
|   |   |-- Message.js
|   |   |-- Notification.js
|   |-- routes/             # API routes
|   |   |-- auth.js
|   |   |-- users.js
|   |   |-- jobs.js
|   |   |-- mou.js
|   |   |-- events.js
|   |   |-- notices.js
|   |   |-- messages.js
|   |   |-- notifications.js
|   |-- middleware/         # Custom middleware
|   |   |-- auth.js
|   |-- .env
|   |-- server.js
|   |-- package.json
|-- package.json           # Root package.json
|-- README.md
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd alumni-networking-portal
```

### 2. Install dependencies
```bash
# Install all dependencies (root, server, and client)
npm run install-all

# Or install separately
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumni_portal
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

#### Frontend Environment
The frontend is configured to proxy requests to the backend. No additional environment setup is needed for development.

### 4. Database Setup
- Make sure MongoDB is running on your system
- The application will automatically create the `alumni_portal` database
- For production, use MongoDB Atlas and update the `MONGODB_URI` in the `.env` file

### 5. Start the Application

#### Development Mode
```bash
# Start both server and client concurrently
npm run dev

# Or start separately
npm run server    # Starts backend on port 5000
npm run client    # Starts frontend on port 3000
```

#### Production Mode
```bash
# Build the frontend
cd client && npm run build

# Start the server
cd ../server && npm start
```

## Usage

### Initial Setup
1. Start the application
2. Register as an admin (first user should be admin)
3. Create student and alumni accounts
4. Post MOUs, events, and notices
5. Alumni can post jobs
6. Students can browse and apply for jobs

### User Roles
- **Student**: View alumni, jobs, MOUs, events, and send messages
- **Alumni**: View students/alumni, post jobs, view MOUs, send messages
- **Admin**: Full system management and content creation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users
- `GET /api/users` - Get all users (with filtering)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/stats` - Get user statistics (Admin only)

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (Alumni/Admin only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/apply` - Apply for job (Student only)
- `GET /api/jobs/my-posted` - Get jobs posted by user (Alumni/Admin only)

### MOUs
- `GET /api/mou` - Get all MOUs (with filtering)
- `GET /api/mou/:id` - Get MOU by ID
- `POST /api/mou` - Create MOU (Admin only)
- `PUT /api/mou/:id` - Update MOU (Admin only)
- `DELETE /api/mou/:id` - Delete MOU (Admin only)
- `GET /api/mou/stats` - Get MOU statistics (Admin only)

### Events
- `GET /api/events` - Get all events (with filtering)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/unregister` - Unregister from event

### Notices
- `GET /api/notices` - Get all notices (with filtering)
- `GET /api/notices/:id` - Get notice by ID
- `POST /api/notices` - Create notice (Admin only)
- `PUT /api/notices/:id` - Update notice (Admin only)
- `DELETE /api/notices/:id` - Delete notice (Admin only)
- `PUT /api/notices/:id/pin` - Pin/unpin notice (Admin only)

### Messages
- `GET /api/messages` - Get user messages
- `GET /api/messages/:id` - Get message by ID
- `POST /api/messages` - Send message
- `POST /api/messages/:id/reply` - Reply to message
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get notification by ID
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/notifications` - Create notification (Admin only)
- `POST /api/notifications/broadcast` - Broadcast notification (Admin only)
- `DELETE /api/notifications/:id` - Delete notification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For any issues or questions, please contact the development team or create an issue in the repository.

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting (already included)
- Validate all inputs (already included)
- Use environment variables for sensitive data
- Regularly update dependencies
