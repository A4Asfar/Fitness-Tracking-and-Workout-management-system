const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  appName: {
    type: String,
    default: 'FitAI'
  },
  supportEmail: {
    type: String,
    default: 'support@fitai.com'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  premiumPricing: {
    type: Number,
    default: 2999
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
