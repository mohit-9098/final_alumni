const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Message = require('../models/Message');
const Job = require('../models/Job');
const Event = require('../models/Event');
const MOU = require('../models/MOU');
const Notice = require('../models/Notice');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with filtering)
// @access  Private (Admin only for all users, Alumni for students and alumni)
router.get('/', auth, [
  query('role').optional().isIn(['student', 'alumni', 'admin']).withMessage('Invalid role'),
  query('graduationYear').optional().isInt({ min: 1950, max: 2030 }).withMessage('Graduation year must be valid'),
  query('branch').optional().trim(),
  query('school').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search, graduationYear, branch, school } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (role) {
      query.role = role;
    }
    
    // Non-admin users can only see students and alumni
    if (req.user.role !== 'admin') {
      query.role = { $in: ['student', 'alumni'] };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.currentCompany': { $regex: search, $options: 'i' } },
        { 'profile.branch': { $regex: search, $options: 'i' } },
        { 'profile.school': { $regex: search, $options: 'i' } }
      ];
    }

    if (graduationYear) {
      query['profile.graduationYear'] = parseInt(graduationYear, 10);
    }
    if (branch) {
      query['profile.branch'] = { $regex: branch, $options: 'i' };
    }
    if (school) {
      query['profile.school'] = { $regex: school, $options: 'i' };
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Total active users by role
    const roleStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recently logged in users by role (last 30 days)
    const recentRoleStats = await User.aggregate([
      { $match: { 
        isActive: true,
        lastLogin: { $gte: thirtyDaysAgo }
      } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalUsers = await User.countDocuments({ isActive: true });
    const recentUsers = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    });
    const activeSessions = await User.countDocuments({
      isActive: true,
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Format response for frontend
    const roleMap = { student: 0, alumni: 0, admin: 0 };
    const recentRoleMap = { student: 0, alumni: 0, admin: 0 };

    roleStats.forEach(stat => {
      roleMap[stat._id] = stat.count;
    });
    recentRoleStats.forEach(stat => {
      recentRoleMap[stat._id] = stat.count;
    });

    res.json({
      totalUsers,
      recentUsers,
      activeSessions,
      roleStats, // [{ _id: 'student', count: X }, ...]
      roleCounts: roleMap,
      recentRoleCounts: recentRoleMap
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/activity/logins
// @desc    Get login activity logs (for admins)
// @access  Private (Admin only)
router.get('/activity/logins', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role = '', days = 30 } = req.query;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    let query = {
      isActive: true,
      lastLogin: { $gte: startDate }
    };
    
    if (role && ['student', 'alumni'].includes(role)) {
      query.role = role;
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('name email role lastLogin createdAt profile.currentCompany profile.branch')
      .sort({ lastLogin: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      logins: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Login activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/connect
// @desc    Send connection request (student -> alumni)
// @access  Private
router.post('/:id/connect', auth, [
  body('message').optional().trim().notEmpty().withMessage('Message cannot be empty if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const targetId = req.params.id;
    const { message } = req.body;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can send connection requests' });
    }

    const targetUser = await User.findById(targetId).select('role isActive');
    if (!targetUser || targetUser.role !== 'alumni') {
      return res.status(400).json({ message: 'Can only connect with alumni' });
    }

    if (!targetUser.isActive) {
      return res.status(400).json({ message: 'Target user is not active' });
    }

    // Check if already connected or pending
    const existingConnection = req.user.connections?.find(conn => 
      conn.user.toString() === targetId && 
      ['pending', 'accepted'].includes(conn.status)
    );

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection request already exists or accepted' });
    }

    // Add connection to student
    req.user.connections = req.user.connections || [];
    req.user.connections.push({
      user: targetId,
      status: 'pending',
      requestedAt: new Date(),
      ...(message && { note: message })
    });
    await req.user.save();

    // Create notification for alumni
    await Notification.create({
      title: 'Connection Request',
      message: `${req.user.name} wants to connect with you${message ? `: ${message}` : ''}`,
      type: 'connection_request',
      recipient: targetId,
      sender: req.user._id,
      relatedEntity: 'connection',
      relatedEntityId: req.user._id, // student's ID
      actionUrl: `/profile/${req.user._id}`,
      priority: 'medium'
    });

    res.status(201).json({ message: 'Connection request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/connections
// @desc    Get user's connections
// @access  Private
router.get('/connections', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    await User.populate(req.user, { path: 'connections.user', select: 'name role profile.avatar currentCompany' });

    const connections = (req.user.connections || []).map(conn => ({
      user: conn.user,
      status: conn.status,
      requestedAt: conn.requestedAt,
      acceptedAt: conn.acceptedAt
    }));

    res.json({ connections });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/connections/pending
// @desc    Get pending connection requests for alumni (students who sent requests to this alumni)
// @access  Private (alumni)
router.get('/connections/pending', auth, authorize('alumni'), async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Find all students who have a pending connection to this alumni
    const students = await User.find({
      role: 'student',
      isActive: true,
      'connections.user': req.user._id,
      'connections.status': 'pending'
    }).select('name email profile branch graduationYear skills connections');

    const pendingRequests = students.map(student => {
      const connection = student.connections.find(
        conn => conn.user.toString() === req.user._id.toString() && conn.status === 'pending'
      );
      return {
        _id: student._id,
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          profile: student.profile
        },
        requestedAt: connection?.requestedAt,
        note: connection?.note || ''
      };
    });

    res.json({ requests: pendingRequests });
  } catch (error) {
    console.error('Pending connections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/connection-status
// @desc    Get connection status with specific user
// @access  Private
router.get('/:id/connection-status', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const connection = (req.user.connections || []).find(
      conn => conn.user.toString() === targetId
    );

    if (!connection) {
      return res.json({ status: 'none' });
    }

    res.json({ 
      status: connection.status,
      requestedAt: connection.requestedAt,
      acceptedAt: connection.acceptedAt 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/connections/:targetId/accept
// @desc    Accept/reject connection request (alumni only)
// @access  Private (alumni)
router.put('/connections/:targetId/accept', auth, authorize('alumni'), [
  body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const targetId = req.params.targetId; // student ID

    const studentUser = await User.findById(targetId);
    if (!studentUser || studentUser.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    // Find connection in student's connections
    const connectionIndex = studentUser.connections?.findIndex(
      conn => conn.user.toString() === req.user._id.toString() && conn.status === 'pending'
    );

    if (connectionIndex === -1) {
      return res.status(400).json({ message: 'No pending connection request found' });
    }

    // Update status
    studentUser.connections[connectionIndex].status = status;
    if (status === 'accepted') {
      studentUser.connections[connectionIndex].acceptedAt = new Date();
    }
    await studentUser.save();

    // Also add/update connection in alumni's connections array (bidirectional)
    if (status === 'accepted') {
      const alumniUser = await User.findById(req.user._id);
      const existingAlumniConn = alumniUser.connections?.find(
        conn => conn.user.toString() === targetId
      );
      if (!existingAlumniConn) {
        alumniUser.connections = alumniUser.connections || [];
        alumniUser.connections.push({
          user: targetId,
          status: 'accepted',
          requestedAt: studentUser.connections[connectionIndex].requestedAt,
          acceptedAt: new Date()
        });
        await alumniUser.save();
      }
    }

    // Create notification for student
    await Notification.create({
      title: status === 'accepted' ? 'Connection Accepted' : 'Connection Rejected',
      message: `${req.user.name} ${status === 'accepted' ? 'accepted' : 'rejected'} your connection request`,
      type: status === 'accepted' ? 'success' : 'info',
      recipient: targetId,
      sender: req.user._id,
      relatedEntity: 'connection',
      relatedEntityId: req.user._id,
      actionUrl: `/profile/${req.user._id}`,
      priority: 'medium'
    });

    res.json({ message: `Connection ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== user._id.toString() && 
        user.role === 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword.trim());
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['student', 'alumni', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    const { name, email, role, isActive, profile } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (profile) user.profile = { ...user.profile, ...profile };
    
    await user.save();
    
    res.json(user.getProfile());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user permanently (Admin only)
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascade delete related data
    await Message.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });
    await Notification.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });

    // Delete jobs posted by user and remove user from other jobs' applications
    await Job.deleteMany({ postedBy: userId });
    await Job.updateMany({ 'applications.user': userId }, { $pull: { applications: { user: userId } } });

    // Delete events organized by user and remove user from other events' attendees
    await Event.deleteMany({ organizedBy: userId });
    await Event.updateMany({ 'attendees.user': userId }, { $pull: { attendees: { user: userId } } });

    await MOU.deleteMany({ addedBy: userId });
    await Notice.deleteMany({ author: userId });

    // Remove user from connections of other users
    await User.updateMany({ 'connections.user': userId }, { $pull: { connections: { user: userId } } });

    // Permanently delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted permanently' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
