const mongoose = require('mongoose');
const { APP_NAME, SUPPORT_EMAIL } = require('../constants/brand');

const systemSettingsSchema = new mongoose.Schema({
  appName: {
    type: String,
    default: APP_NAME
  },
  supportEmail: {
    type: String,
    default: SUPPORT_EMAIL
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
