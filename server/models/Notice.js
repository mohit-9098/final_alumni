const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['academic', 'placement', 'general', 'urgent', 'achievement', 'reminder'],
    required: [true, 'Category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    required: [true, 'Priority is required']
  },
  targetAudience: [{
    type: String,
    enum: ['student', 'alumni', 'admin', 'all'],
    required: [true, 'Target audience is required']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
noticeSchema.index({ targetAudience: 1, isActive: 1, publishDate: -1 });
noticeSchema.index({ category: 1, priority: 1, publishDate: -1 });

// Index for search functionality
noticeSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Method to increment view count
noticeSchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

// Method to check if notice is still active
noticeSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  if (this.expiryDate && this.expiryDate <= new Date()) return false;
  return true;
};

// Pre-save hook to ensure publish date is not in the future
noticeSchema.pre('save', function(next) {
  if (this.publishDate > new Date()) {
    this.publishDate = new Date();
  }
  next();
});

module.exports = mongoose.model('Notice', noticeSchema);
