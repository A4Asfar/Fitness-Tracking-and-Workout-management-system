const mongoose = require('mongoose');

const trainerConsultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trainerName: {
    type: String,
    required: true,
  },
  trainerSpecialization: {
    type: String,
    required: true,
  },
  consultedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TrainerConsult', trainerConsultSchema);
