const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['member', 'silver', 'gold', 'vip', 'vip1', 'vip2', 'diamond', 'platinum'],
    default: 'member'
  },
  planName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // days
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active'
  },
  features: {
    dailyChats: { type: Number, default: 10 },
    maxPhotos: { type: Number, default: 3 },
    maxVideos: { type: Number, default: 1 },
    spinWheelInterval: { type: Number, default: 1440 }, // minutes
    dailyBonus: { type: Number, default: 500 },
    votePoints: { type: Number, default: 0 },
    profileVideos: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    premiumFrame: { type: Boolean, default: false },
    pinnedPosts: { type: Number, default: 0 },
    blurPhotos: { type: Number, default: 0 },
    chatRooms: { type: Number, default: 0 },
    hideOnlineStatus: { type: Boolean, default: false },
    transferCoins: { type: Boolean, default: false },
    bonusCoins: { type: Number, default: 0 }
  },
  paymentInfo: {
    transactionId: String,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentDate: Date
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update updatedAt on save
MembershipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if membership is expired
MembershipSchema.methods.isExpired = function() {
  return this.endDate < new Date();
};

// Calculate days remaining
MembershipSchema.methods.daysRemaining = function() {
  const now = new Date();
  const diff = this.endDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Auto-expire check
MembershipSchema.methods.checkAndUpdateStatus = function() {
  if (this.isExpired() && this.status === 'active') {
    this.status = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Membership', MembershipSchema);
