const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { auth, authorize } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET /api/messages
// @desc    Get user messages (sent and received)
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['sent', 'received']).withMessage('Type must be sent or received'),
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
    let query = { isDeleted: false };
    
    if (type === 'sent') {
      query.sender = req.user._id;
    } else if (type === 'received') {
      query.recipient = req.user._id;
    } else {
      query.$or = [
        { sender: req.user._id },
        { recipient: req.user._id }
      ];
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = -1;
    
    const messages = await Message.find(query)
      .populate('sender', 'name email profile.avatar')
      .populate('recipient', 'name email profile.avatar')
      .populate('replyTo', 'subject')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({ 
      recipient: req.user._id, 
      isRead: false,
      isDeleted: false
    });
    
    res.json({
      messages,
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

// @route   GET /api/messages/:id
// @desc    Get message by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email profile.avatar profile.currentCompany')
      .populate('recipient', 'name email profile.avatar profile.currentCompany')
      .populate('replyTo', 'subject content sender recipient');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is sender or recipient
    if (message.sender._id.toString() !== req.user._id.toString() && 
        message.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Mark as read if recipient
    if (message.recipient._id.toString() === req.user._id.toString() && !message.isRead) {
      await message.markAsRead();
    }
    
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth, [
  body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { recipient, subject, content, priority = 'medium', replyTo } = req.body;
    
    // Check if recipient exists
    const User = require('../models/User');
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Check if recipient is active
    if (!recipientUser.isActive) {
      return res.status(400).json({ message: 'Recipient account is not active' });
    }

    // Check connection requirement: student -> alumni needs accepted connection
    if (req.user.role === 'student' && recipientUser.role === 'alumni') {
      const senderUser = await User.findById(req.user._id).select('connections');
      const connection = senderUser.connections?.find(
        conn => conn.user.toString() === recipient && conn.status === 'accepted'
      );
      if (!connection) {
        return res.status(403).json({ message: 'Must be connected to message alumni. Send a connection request first.' });
      }
    }
    
    // Create message
    const message = new Message({
      sender: req.user._id,
      recipient,
      subject,
      content,
      priority,
      replyTo
    });
    
    await message.save();
    
    // Create notification for recipient
    await Notification.create({
      title: 'New Message',
      message: `${req.user.name} sent you a message: ${subject}`,
      type: 'info',
      recipient: recipientUser._id,
      sender: req.user._id,
      relatedEntity: 'message',
      relatedEntityId: message._id,
      actionUrl: `/messages/${message._id}`,
      priority
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/:id/reply
// @desc    Reply to a message
// @access  Private
router.post('/:id/reply', auth, [
  body('content').trim().notEmpty().withMessage('Reply content is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const originalMessage = await Message.findById(req.params.id);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }
    
    // Check if user is recipient or sender of original message
    if (originalMessage.recipient.toString() !== req.user._id.toString() && 
        originalMessage.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { content, priority = 'medium' } = req.body;
    
    // Determine recipient (the other person in the conversation)
    const recipientId = originalMessage.sender.toString() === req.user._id.toString() 
      ? originalMessage.recipient 
      : originalMessage.sender;
    
    // Create reply
    const reply = new Message({
      sender: req.user._id,
      recipient: recipientId,
      subject: `Re: ${originalMessage.subject}`,
      content,
      priority,
      replyTo: originalMessage._id
    });
    
    await reply.save();
    
    // Create notification for recipient
    await Notification.create({
      title: 'Message Reply',
      message: `${req.user.name} replied to your message`,
      type: 'info',
      recipient: recipientId,
      sender: req.user._id,
      relatedEntity: 'message',
      relatedEntityId: reply._id,
      actionUrl: `/messages/${reply._id}`,
      priority
    });
    
    res.status(201).json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await message.markAsRead();
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/read-all
// @desc    Mark all messages as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { recipient: req.user._id, isRead: false, isDeleted: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({ message: 'All messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is sender or recipient
    if (message.sender.toString() !== req.user._id.toString() && 
        message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await message.softDelete();
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation between current user and another user
// @access  Private
router.get('/conversation/:userId', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const otherUserId = req.params.userId;
    
    // Check if other user exists
    const User = require('../models/User');
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id }
      ],
      isDeleted: false
    })
      .populate('sender', 'name email profile.avatar')
      .populate('recipient', 'name email profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id }
      ],
      isDeleted: false
    });
    
    res.json({
      messages,
      otherUser: {
        _id: otherUser._id,
        name: otherUser.name,
        email: otherUser.email,
        avatar: otherUser.profile.avatar,
        currentCompany: otherUser.profile.currentCompany
      },
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

module.exports = router;
