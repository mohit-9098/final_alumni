const mongoose = require('mongoose');

const mouSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'MOU title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  partnerOrganization: {
    type: String,
    required: [true, 'Partner organization is required'],
    trim: true,
    maxlength: [200, 'Partner organization cannot exceed 200 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  documentUrl: {
    type: String,
    required: [true, 'Document URL is required'],
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  category: {
    type: String,
    enum: ['academic', 'research', 'industry', 'international', 'training', 'other'],
    required: [true, 'Category is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'pending', 'terminated'],
    default: 'active'
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Contact person email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      match: [/^[+]?[\d\s-()]+$/, 'Please enter a valid phone number']
    }
  },
  benefits: [{
    type: String,
    trim: true,
    maxlength: [300, 'Each benefit cannot exceed 300 characters']
  }],
  objectives: [{
    type: String,
    trim: true,
    maxlength: [300, 'Each objective cannot exceed 300 characters']
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Added by is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
mouSchema.index({ title: 'text', partnerOrganization: 'text', description: 'text' });

// Method to increment view count
mouSchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

// Method to check if MOU is still active
mouSchema.methods.isCurrentlyActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

module.exports = mongoose.model('MOU', mouSchema);
