const mongoose = require('mongoose');

const sessionEventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  eventType: { type: String, required: true }, // 'code-change' | 'output-change'
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SessionEvent', sessionEventSchema);
