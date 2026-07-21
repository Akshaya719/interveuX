const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  title: { type: String, required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: String, required: true, unique: true },
  language: { type: String, default: 'javascript' },
  duration: { type: Number, default: 60 }, // in minutes
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
