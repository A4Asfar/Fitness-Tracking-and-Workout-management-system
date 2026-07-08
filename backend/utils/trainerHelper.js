const mongoose = require('mongoose');
const Trainer = require('../models/Trainer');

/**
 * Resolve a trainer by MongoDB ObjectId or legacy slug id (e.g. "ahmed-ali").
 */
async function resolveTrainer(param) {
  if (!param) return null;

  if (mongoose.Types.ObjectId.isValid(param) && String(new mongoose.Types.ObjectId(param)) === param) {
    return Trainer.findById(param);
  }

  return Trainer.findOne({ id: param });
}

module.exports = { resolveTrainer };
