const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'login', 
      'logout', 
      'registration', 
      'profile_update', 
      'password_change',
      'membership_upgrade',
      'membership_cancelled',
      'payment_completed',
      'payment_failed',
      'user_banned',
      'user_unbanned'
    ],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance
UserActivitySchema.index({ user: 1, createdAt: -1 });
UserActivitySchema.index({ activityType: 1, createdAt: -1 });

module.exports = mongoose.model('UserActivity', UserActivitySchema);
