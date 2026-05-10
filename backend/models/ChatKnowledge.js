const mongoose = require('mongoose');

const ChatKnowledgeSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  keywords: [{ type: String }],
  responses: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('ChatKnowledge', ChatKnowledgeSchema);
