const mongoose = require('mongoose');

const PremiumPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    required: true // 'Monthly' or 'Lifetime'
  },
  paymentMethod: {
    type: String,
    required: true // 'EasyPaisa' or 'JazzCash'
  },
  paymentNumber: {
    type: String
  },
  screenshotUrl: {
    type: String,
    required: true // base64 payload
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  adminRemarks: {
    type: String
  }
});

module.exports = mongoose.model('PremiumPayment', PremiumPaymentSchema);
