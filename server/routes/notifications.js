const express = require('express');
const { body, query } = require('express-validator');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['info', 'success', 'warning', 'error', 'job', 'event', 'notice']).withMessage('Invalid type'),
  query('isRead').optional().isBoolean().withMessage('isRead must be a boolean')
], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      isRead,
      sortBy = 'createdAt'
    } = req.query;
    
    // Build query
    let query = { recipient: req.user._id };
    
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = -1;
    
    const notifications = await Notification.find(query)
      .populate('sender', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });
    
    res.json({
      notifications,
      unreadCount,
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

// @route   GET /api/notifications/:id
// @desc    Get notification by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is the recipient
    if (notification.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await notification.markAsRead();
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').isIn(['info', 'success', 'warning', 'error', 'job', 'event', 'notice']).withMessage('Invalid type'),
  body('recipient').isMongoId().withMessage('Valid recipient ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const notificationData = {
      ...req.body,
      sender: req.user._id
    };
    
    const notification = new Notification(notificationData);
    await notification.save();
    
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/broadcast
// @desc    Send broadcast notification to multiple users
// @access  Private (Admin only)
router.post('/broadcast', auth, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').isIn(['info', 'success', 'warning', 'error', 'job', 'event', 'notice']).withMessage('Invalid type'),
  body('targetAudience').isArray().withMessage('Target audience must be an array'),
  body('targetAudience.*').isIn(['student', 'alumni', 'admin']).withMessage('Invalid target audience')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, message, type, targetAudience, priority = 'medium', actionUrl } = req.body;
    
    // Get all users in target audience
    const User = require('../models/User');
    const users = await User.find({ 
      role: { $in: targetAudience }, 
      isActive: true 
    });
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      title,
      message,
      type,
      recipient: user._id,
      sender: req.user._id,
      priority,
      actionUrl
    }));
    
    const result = await Notification.insertMany(notifications);
    
    res.json({ 
      message: `Broadcast notification sent to ${result.length} users`,
      sentCount: result.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is the recipient or sender (admin)
    if (notification.recipient.toString() !== req.user._id.toString() && 
        notification.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
