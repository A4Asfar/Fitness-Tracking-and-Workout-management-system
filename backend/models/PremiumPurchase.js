const mongoose = require('mongoose');

const premiumPurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['Monthly Plan', 'Yearly Plan'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['EasyPaisa', 'JazzCash', 'Bank Transfer'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  paymentScreenshot: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Expired'],
    default: 'Pending'
  },
  adminRemarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PremiumPurchase', premiumPurchaseSchema);
