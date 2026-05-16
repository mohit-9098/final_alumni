const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Event = require('../models/Event');


const { auth, authorize } = require('../middleware/auth');

const router = express.Router();



// @route   GET /api/events

// @desc    Get all events with filtering
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['seminar', 'workshop', 'webinar', 'meetup', 'meeting', 'conference', 'networking', 'other']).withMessage('Invalid event type'),
  query('mode').optional().isIn(['online', 'offline', 'hybrid']).withMessage('Invalid event mode'),
  query('status').optional().isIn(['upcoming', 'past', 'all']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      type, 
      mode,
      status = 'upcoming',
      sortBy = 'date'
    } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    // Filter by status
    if (status === 'upcoming') {
      query.date = { $gte: new Date() };
    } else if (status === 'past') {
      query.date = { $lt: new Date() };
    }
    
    // Filter by target audience
    query.$or = [
      { targetAudience: req.user.role },
      { targetAudience: 'all' }
    ];
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type) query.type = type;
    if (mode) query.mode = mode;
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = status === 'upcoming' ? 1 : -1;
    
    const events = await Event.find(query)
      .populate('organizedBy', 'name email profile.currentCompany')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
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

// @route   GET /api/events/my-events
// @desc    Get events organized by current user
// @access  Private (Admin only)
router.get('/my-events', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { organizedBy: req.user._id, isActive: true };
    
    if (status === 'upcoming') {
      query.date = { $gte: new Date() };
    } else if (status === 'past') {
      query.date = { $lt: new Date() };
    }
    
    const events = await Event.find(query)
      .populate('attendees.user', 'name email profile.avatar')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
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

// @route   GET /api/events/stats
// @desc    Get event statistics  
// @access  Private (Admin only)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({ 
      isActive: true,
      date: { $gte: new Date() }
    });
    const pastEvents = await Event.countDocuments({ 
      isActive: true,
      date: { $lt: new Date() }
    });

    res.json({
      totalEvents,
      upcomingEvents,
      pastEvents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// @route   GET /api/events/my-registrations
// @desc    Get events user is registered for
// @access  Private
router.get('/my-registrations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'upcoming' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { 
      'attendees.user': req.user._id, 
      isActive: true 
    };
    
    if (status === 'upcoming') {
      query.date = { $gte: new Date() };
    } else if (status === 'past') {
      query.date = { $lt: new Date() };
    }
    
    const events = await Event.find(query)
      .populate('organizedBy', 'name email profile.currentCompany')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
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

// @route   GET /api/events/:id

// @desc    Get event by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizedBy', 'name email profile.currentCompany profile.jobTitle')
      .populate('attendees.user', 'name email profile.avatar profile.graduationYear');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user can access this event
    if (!event.targetAudience.includes(req.user.role) && !event.targetAudience.includes('all')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid event date is required'),
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format is HH:MM'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(['seminar', 'workshop', 'webinar', 'meetup', 'meeting', 'conference', 'networking', 'other']).withMessage('Invalid event type'),
  body('mode').isIn(['online', 'offline', 'hybrid']).withMessage('Invalid event mode'),
  body('maxParticipants').isInt({ min: 1, max: 1000 }).withMessage('Max participants must be between 1 and 1000'),
  body('registrationDeadline').isISO8601().withMessage('Valid registration deadline is required'),
  body('targetAudience').isArray().withMessage('Target audience must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const eventData = {
      ...req.body,
      organizedBy: req.user._id
    };
    
    const event = new Event(eventData);
    await event.save();
    
    // Create notifications for target audience
    const User = require('../models/User');
    const audienceQuery = req.body.targetAudience.includes('all') 
      ? { role: { $in: ['student', 'alumni'] }, isActive: true }
      : { role: { $in: req.body.targetAudience }, isActive: true };
    
    const users = await User.find(audienceQuery);
    const notifications = users.map(user => ({
      title: 'New Event Posted',
      message: `${req.user.name} posted a new event: ${event.title}`,
      type: 'event',
      recipient: user._id,
      sender: req.user._id,
      relatedEntity: 'event',
      relatedEntityId: event._id,
      actionUrl: `/events/${event._id}`
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), [
  body('title').optional().trim().notEmpty().withMessage('Event title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Update event
    Object.assign(event, req.body);
    await event.save();
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Soft delete by deactivating
    event.isActive = false;
    await event.save();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user can register
    if (!event.targetAudience.includes(req.user.role) && !event.targetAudience.includes('all')) {
      return res.status(403).json({ message: 'You are not eligible for this event' });
    }
    
    // Check if registration deadline has passed
    if (event.registrationDeadline < new Date()) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }
    
    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    // Check if already registered
    if (event.isUserRegistered(req.user._id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    await event.registerUser(req.user._id);
    
    // Create notification for organizer
    await Notification.create({
      title: 'New Event Registration',
      message: `${req.user.name} registered for your event: ${event.title}`,
      type: 'info',
      recipient: event.organizedBy,
      sender: req.user._id,
      relatedEntity: 'event',
      relatedEntityId: event._id,
      actionUrl: `/events/${event._id}/attendees`
    });
    
    res.json({ message: 'Successfully registered for the event' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/unregister
// @desc    Unregister from an event
// @access  Private
router.post('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is registered
    if (!event.isUserRegistered(req.user._id)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }
    
    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== req.user._id.toString()
    );
    event.currentParticipants -= 1;
    await event.save();
    
    res.json({ message: 'Successfully unregistered from the event' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
