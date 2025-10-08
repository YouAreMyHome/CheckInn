/**
 * Hotel Model for CheckInn Hotel Booking Platform
 * 
 * Business-focused schema với practical features
 * 
 * @author CheckInn Team
 * @version 2.0.0
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

// Location Schema
const locationSchema = new mongoose.Schema({
  address: { 
    type: String, 
    required: [true, 'Address is required'],
    trim: true 
  },
  city: { 
    type: String, 
    required: [true, 'City is required'],
    trim: true,
    index: true
  },
  country: { 
    type: String, 
    required: [true, 'Country is required'],
    trim: true,
    default: 'Vietnam'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    validate: {
      validator: function(val) {
        return !val || val.length === 2;
      },
      message: 'Coordinates must be [longitude, latitude]'
    }
  }
}, { _id: false });

// Contact Schema
const contactSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  website: { 
    type: String, 
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must start with http:// or https://']
  }
}, { _id: false });

// Amenity Schema
const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  category: { 
    type: String, 
    enum: ['general', 'business', 'recreation', 'dining', 'transport'],
    default: 'general'
  }
}, { _id: false });

// Image Schema
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  caption: { type: String },
  isPrimary: { type: Boolean, default: false }
}, { _id: false });

// Main Hotel Schema
const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    index: 'text'
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    index: 'text'
  },
  
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  
  // Hotel Classification
  category: {
    type: String,
    enum: ['budget', 'business', 'luxury', 'resort', 'boutique'],
    required: [true, 'Hotel category is required'],
    index: true
  },
  
  starRating: {
    type: Number,
    min: [1, 'Star rating must be at least 1'],
    max: [5, 'Star rating cannot exceed 5'],
    required: [true, 'Star rating is required']
  },
  
  // Location & Contact
  location: {
    type: locationSchema,
    required: [true, 'Location information is required']
  },
  
  contact: {
    type: contactSchema,
    required: [true, 'Contact information is required']
  },
  
  // Media
  images: [imageSchema],
  
  // Features & Amenities
  amenities: [amenitySchema],
  
  // Pricing
  priceRange: {
    min: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Price cannot be negative']
    },
    max: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Price cannot be negative']
    }
  },
  
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR']
  },
  
  // Business Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending',
    index: true
  },
  
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics & Reviews
  stats: {
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: [0, 'Booking count cannot be negative']
    },
    responseRate: {
      type: Number,
      default: 0,
      min: [0, 'Response rate cannot be negative'],
      max: [100, 'Response rate cannot exceed 100']
    }
  },
  
  // Business Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hotel owner is required'],
    index: true
  },
  
  // Policies
  policies: {
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '12:00' },
    cancellationPolicy: { 
      type: String, 
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    petPolicy: { 
      type: String,
      enum: ['allowed', 'not-allowed', 'conditional'],
      default: 'not-allowed'
    },
    smokingPolicy: { 
      type: String,
      enum: ['allowed', 'not-allowed', 'designated-areas'],
      default: 'not-allowed'
    }
  },
  
  // SEO & Marketing
  seo: {
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    keywords: [String]
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
hotelSchema.index({ 'location.coordinates': '2dsphere' });
hotelSchema.index({ name: 'text', description: 'text' });
hotelSchema.index({ category: 1, starRating: -1 });
hotelSchema.index({ status: 1, isVerified: 1 });
hotelSchema.index({ 'stats.averageRating': -1 });
hotelSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual for room count
hotelSchema.virtual('roomCount', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
  count: true
});

// Virtual for available rooms
hotelSchema.virtual('availableRooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel',
  match: { status: 'available' },
  count: true
});

// Pre-save middleware
hotelSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Validate price range
  if (this.priceRange.min >= this.priceRange.max) {
    return next(new Error('Maximum price must be greater than minimum price'));
  }
  
  // Auto-generate short description
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 197) + '...';
  }
  
  next();
});

// Instance methods
hotelSchema.methods.updateRating = async function() {
  const stats = await mongoose.model('Review').aggregate([
    { $match: { hotel: this._id } },
    { 
      $group: { 
        _id: null, 
        avgRating: { $avg: '$rating' }, 
        count: { $sum: 1 } 
      } 
    }
  ]);
  
  if (stats.length > 0) {
    this.stats.averageRating = Math.round(stats[0].avgRating * 10) / 10;
    this.stats.totalReviews = stats[0].count;
  } else {
    this.stats.averageRating = 0;
    this.stats.totalReviews = 0;
  }
  
  return this.save();
};

hotelSchema.methods.addBooking = function() {
  this.stats.totalBookings += 1;
  return this.save();
};

hotelSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

// Static methods
hotelSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active'
  });
};

hotelSchema.statics.search = function(query, options = {}) {
  const {
    category,
    minRating = 0,
    maxPrice,
    minPrice,
    city,
    amenities,
    limit = 20,
    skip = 0,
    sortBy = '-stats.averageRating'
  } = options;
  
  const filter = { status: 'active' };
  
  // Text search
  if (query) {
    filter.$text = { $search: query };
  }
  
  // Category filter
  if (category) {
    filter.category = category;
  }
  
  // Rating filter
  if (minRating > 0) {
    filter['stats.averageRating'] = { $gte: minRating };
  }
  
  // Price filter
  if (minPrice || maxPrice) {
    filter.$or = [];
    if (minPrice) filter.$or.push({ 'priceRange.min': { $gte: minPrice } });
    if (maxPrice) filter.$or.push({ 'priceRange.max': { $lte: maxPrice } });
  }
  
  // City filter
  if (city) {
    filter['location.city'] = new RegExp(city, 'i');
  }
  
  // Amenities filter
  if (amenities && amenities.length > 0) {
    filter['amenities.name'] = { $in: amenities };
  }
  
  return this.find(filter)
    .sort(sortBy)
    .limit(limit)
    .skip(skip)
    .populate('owner', 'name email')
    .select('-__v');
};

module.exports = mongoose.model('Hotel', hotelSchema);