const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filtering
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['full-time', 'part-time', 'internship', 'contract', 'remote']).withMessage('Invalid job type'),
  query('experience').optional().isIn(['entry-level', 'mid-level', 'senior-level', 'executive']).withMessage('Invalid experience level')
], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      experience, 
      location,
      company,
      sortBy = 'createdAt'
    } = req.query;
    
    // Build query
    let query = { 
      isActive: true,
      applicationDeadline: { $gt: new Date() }
    };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type) query.type = type;
    if (experience) query.experience = experience;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = -1;
    
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email profile.currentCompany')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
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

// @route   GET /api/jobs/my-posted
// @desc    Get jobs posted by current user
// @access  Private (Alumni and Admin only)
router.get('/my-posted', auth, authorize('alumni', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('applications.user', 'name email profile.graduationYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments({ postedBy: req.user._id });
    
    res.json({
      jobs,
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


// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profile.currentCompany profile.jobTitle');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Increment view count
    await job.incrementView();
    
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private (Alumni and Admin only)
router.post('/', auth, authorize('alumni', 'admin'), [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(['full-time', 'part-time', 'internship', 'contract', 'remote']).withMessage('Invalid job type'),
  body('experience').isIn(['entry-level', 'mid-level', 'senior-level', 'executive']).withMessage('Invalid experience level'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid application deadline is required'),
  body('applicationLink').isURL().withMessage('Valid application link is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };
    
    const job = new Job(jobData);
    await job.save();
    
    // Create notifications for students
    const students = await User.find({ role: 'student', isActive: true });
    const notifications = students.map(student => ({
      title: 'New Job Posted',
      message: `${req.user.name} posted a new job: ${job.title}`,
      type: 'job',
      recipient: student._id,
      sender: req.user._id,
      relatedEntity: 'job',
      relatedEntityId: job._id,
      actionUrl: `/jobs/${job._id}`
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Job poster or Admin only)
router.put('/:id', auth, [
  body('title').optional().trim().notEmpty().withMessage('Job title cannot be empty'),
  body('company').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check permissions
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update job
    Object.assign(job, req.body);
    await job.save();
    
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Job poster or Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check permissions
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Soft delete by deactivating
    job.isActive = false;
    await job.save();
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Students only)
router.post('/:id/apply', auth, authorize('student'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if already applied
    if (job.applications.some(app => app.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    // Check if application deadline has passed
    if (job.applicationDeadline < new Date()) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }
    
    // Add application
    job.applications.push({
      user: req.user._id,
      status: 'pending'
    });
    
    await job.save();
    
    // Create notification for job poster
    await Notification.create({
      title: 'New Job Application',
      message: `${req.user.name} applied for your job: ${job.title}`,
      type: 'info',
      recipient: job.postedBy,
      sender: req.user._id,
      relatedEntity: 'job',
      relatedEntityId: job._id,
      actionUrl: `/jobs/${job._id}/applications`
    });
    
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
