const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Notice = require('../models/Notice');
const { auth, authorize } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET /api/notices
// @desc    Get all notices with filtering
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['academic', 'placement', 'general', 'urgent', 'achievement', 'reminder']).withMessage('Invalid category'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      priority,
      sortBy = 'publishDate'
    } = req.query;
    
    // Build query
    let query = { 
      isActive: true,
      $or: [
        { targetAudience: req.user.role },
        { targetAudience: 'all' }
      ]
    };
    
    // Filter out expired notices
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    });
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = -1;
    sortOptions.isPinned = -1; // Pinned notices first
    
    const notices = await Notice.find(query)
      .populate('author', 'name email profile.currentCompany')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notice.countDocuments(query);
    
    res.json({
      notices,
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

// @route   GET /api/notices/stats
// @desc    Get notice statistics
// @access  Private (Admin only)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await Notice.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          pinnedCount: {
            $sum: { $cond: ['$isPinned', 1, 0] }
          }
        }
      }
    ]);
    
    const totalNotices = await Notice.countDocuments({ isActive: true });
    const activeNotices = await Notice.countDocuments({ 
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    });
    const pinnedNotices = await Notice.countDocuments({ 
      isActive: true, 
      isPinned: true 
    });
    const urgentNotices = await Notice.countDocuments({ 
      isActive: true, 
      priority: 'urgent' 
    });
    
    res.json({
      totalNotices,
      activeNotices,
      pinnedNotices,
      urgentNotices,
      categoryStats: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/notices/my-notices
// @desc    Get notices posted by current user
// @access  Private (Admin only)
router.get('/my-notices', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { author: req.user._id };
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    const notices = await Notice.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notice.countDocuments(query);
    
    res.json({
      notices,
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


// @route   GET /api/notices/:id
// @desc    Get notice by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name email profile.currentCompany profile.jobTitle');
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Check if user can access this notice
    if (!notice.targetAudience.includes(req.user.role) && !notice.targetAudience.includes('all')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if notice is still active
    if (!notice.isCurrentlyActive()) {
      return res.status(404).json({ message: 'Notice is no longer active' });
    }
    
    // Increment view count
    await notice.incrementView();
    
    res.json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notices
// @desc    Create a new notice
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Notice title is required'),
  body('content').trim().notEmpty().withMessage('Notice content is required'),
  body('category').isIn(['academic', 'placement', 'general', 'urgent', 'achievement', 'reminder']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('targetAudience').isArray().withMessage('Target audience must be an array'),
  body('targetAudience.*').isIn(['student', 'alumni', 'admin', 'all']).withMessage('Invalid target audience')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const noticeData = {
      ...req.body,
      author: req.user._id
    };
    
    const notice = new Notice(noticeData);
    await notice.save();
    
    // Create notifications for target audience
    const User = require('../models/User');
    const audienceQuery = req.body.targetAudience.includes('all') 
      ? { role: { $in: ['student', 'alumni'] }, isActive: true }
      : { role: { $in: req.body.targetAudience }, isActive: true };
    
    const users = await User.find(audienceQuery);
    const notifications = users.map(user => ({
      title: 'New Notice Posted',
      message: `${req.user.name} posted a new notice: ${notice.title}`,
      type: 'notice',
      recipient: user._id,
      sender: req.user._id,
      relatedEntity: 'notice',
      relatedEntityId: notice._id,
      actionUrl: `/notices/${notice._id}`,
      priority: notice.priority
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notices/:id
// @desc    Update notice
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), [
  body('title').optional().trim().notEmpty().withMessage('Notice title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Notice content cannot be empty'),
  body('category').optional().isIn(['academic', 'placement', 'general', 'urgent', 'achievement', 'reminder']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Update notice
    Object.assign(notice, req.body);
    await notice.save();
    
    res.json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notices/:id
// @desc    Delete notice
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    // Soft delete by deactivating
    notice.isActive = false;
    await notice.save();
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notices/:id/pin
// @desc    Pin/unpin notice
// @access  Private (Admin only)
router.put('/:id/pin', auth, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    notice.isPinned = !notice.isPinned;
    await notice.save();
    
    res.json({ 
      message: `Notice ${notice.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: notice.isPinned
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
