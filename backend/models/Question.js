const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags: [{ type: String }],
  companies: [{ type: String }],
  constraints: { type: String, default: '' },
  hints: [{ type: String }],
  starterCode: {
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' },
  },
  solution: { type: String, default: '' },
  visibleTestCases: [{ input: String, expectedOutput: String }],
  hiddenTestCases: [{ input: String, expectedOutput: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
