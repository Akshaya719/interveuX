const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  output: { type: String },
  score: { type: Number, default: 0 },
  executionHistory: [{
    timestamp: { type: Date, default: Date.now },
    status: String, // 'Passed', 'Compilation Error', 'Runtime Error'
    passedVisible: Number,
    totalVisible: Number,
    passedHidden: Number,
    totalHidden: Number,
  }],
  metrics: {
    runs: { type: Number, default: 0 },
    passedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    durationSpent: { type: Number, default: 0 } // seconds
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
