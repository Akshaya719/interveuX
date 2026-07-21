const express = require('express');
const SessionEvent = require('../models/SessionEvent');
const Submission = require('../models/Submission');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all events for a session (for replay)
router.get('/:sessionId/events', authMiddleware, async (req, res) => {
  try {
    const events = await SessionEvent.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch session events' });
  }
});

// POST save or update draft submission
router.post('/save-draft', authMiddleware, async (req, res) => {
  try {
    const { interviewId, candidateId, language, code } = req.body;
    const userId = candidateId || req.user.id;
    const submission = await Submission.findOneAndUpdate(
      { interviewId, candidateId: userId },
      { language, code, output: '' },
      { upsert: true, new: true }
    );
    res.status(200).json(submission);
  } catch (e) {
    res.status(500).json({ message: 'Failed to save draft' });
  }
});

// POST submit interview
router.post('/:sessionId/submit', authMiddleware, async (req, res) => {
  try {
    const { interviewId, runs, passedTests, totalTests, code, language, durationSpent } = req.body;
    const userId = req.user.id;
    
    // Save final submission details
    const submission = await Submission.findOneAndUpdate(
      { interviewId, candidateId: userId },
      { 
        language, 
        code, 
        score: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
        metrics: { runs, passedTests, totalTests, durationSpent }
      },
      { upsert: true, new: true }
    );

    // Update Interview status
    const Interview = require('../models/Interview');
    await Interview.findByIdAndUpdate(interviewId, { status: 'completed' });

    res.status(200).json(submission);
  } catch (e) {
    res.status(500).json({ message: 'Failed to submit interview' });
  }
});

module.exports = router;
