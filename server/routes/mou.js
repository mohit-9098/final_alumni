const express = require('express');
const { body, query, validationResult } = require('express-validator');
const MOU = require('../models/MOU');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/mou
// @desc    Get all MOUs with filtering
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['academic', 'research', 'industry', 'international', 'training', 'other']).withMessage('Invalid category'),
  query('status').optional().isIn(['active', 'expired', 'pending', 'terminated']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      status,
      sortBy = 'createdAt'
    } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = -1;
    
    const mous = await MOU.find(query)
      .populate('addedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MOU.countDocuments(query);
    
    res.json({
      mous,
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

// @route   GET /api/mou/stats
// @desc    Get MOU statistics
// @access  Private (Admin only)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await MOU.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$status', 'active'] },
                  { $gt: ['$endDate', new Date()] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const totalMOUs = await MOU.countDocuments({ isActive: true });
    const activeMOUs = await MOU.countDocuments({ 
      isActive: true, 
      status: 'active',
      endDate: { $gt: new Date() }
    });
    const expiredMOUs = await MOU.countDocuments({ 
      isActive: true, 
      $or: [
        { status: 'expired' },
        { endDate: { $lte: new Date() } }
      ]
    });
    
    res.json({
      totalMOUs,
      activeMOUs,
      expiredMOUs,
      categoryStats: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/mou/:id
// @desc    Get MOU by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const mou = await MOU.findById(req.params.id)
      .populate('addedBy', 'name email profile.currentCompany');
    
    if (!mou) {
      return res.status(404).json({ message: 'MOU not found' });
    }
    
    // Increment view count
    await mou.incrementView();
    
    res.json(mou);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mou
// @desc    Create a new MOU
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('MOU title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('partnerOrganization').trim().notEmpty().withMessage('Partner organization is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('documentUrl').isURL().withMessage('Valid document URL is required'),
  body('category').isIn(['academic', 'research', 'industry', 'international', 'training', 'other']).withMessage('Invalid category'),
  body('contactPerson.name').trim().notEmpty().withMessage('Contact person name is required'),
  body('contactPerson.email').isEmail().withMessage('Valid contact person email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const mouData = {
      ...req.body,
      addedBy: req.user._id
    };
    
    const mou = new MOU(mouData);
    await mou.save();
    
    res.status(201).json(mou);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/mou/:id
// @desc    Update MOU
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), [
  body('title').optional().trim().notEmpty().withMessage('MOU title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('partnerOrganization').optional().trim().notEmpty().withMessage('Partner organization cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const mou = await MOU.findById(req.params.id);
    if (!mou) {
      return res.status(404).json({ message: 'MOU not found' });
    }
    
    // Update MOU
    Object.assign(mou, req.body);
    await mou.save();
    
    res.json(mou);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/mou/:id
// @desc    Delete MOU
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const mou = await MOU.findById(req.params.id);
    if (!mou) {
      return res.status(404).json({ message: 'MOU not found' });
    }
    
    // Soft delete by deactivating
    mou.isActive = false;
    await mou.save();
    
    res.json({ message: 'MOU deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
