const express = require('express');
const { createInterview, getInterviews, getInterviewByRoomId, deleteInterview } = require('../controllers/interviewController');
const { authMiddleware, interviewerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, interviewerOnly, createInterview);
router.get('/', authMiddleware, getInterviews);
router.get('/candidate/stats', authMiddleware, async (req, res) => {
  const { getCandidateStats } = require('../controllers/interviewController');
  await getCandidateStats(req, res);
});
router.get('/:roomId', authMiddleware, getInterviewByRoomId);
router.put('/:id', authMiddleware, interviewerOnly, async (req, res) => {
  const Interview = require('../models/Interview');
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.status(200).json(interview);
  } catch (e) { res.status(500).json({ message: 'Failed to update interview' }); }
});
router.delete('/:id', authMiddleware, interviewerOnly, deleteInterview);

module.exports = router;
