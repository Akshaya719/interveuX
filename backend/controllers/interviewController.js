const Interview = require('../models/Interview');
const { v4: uuidv4 } = require('uuid');

const createInterview = async (req, res) => {
  try {
    const { title, language, duration, questionId, candidateId } = req.body;
    const interviewerId = req.user.id; // From auth middleware
    const roomId = uuidv4();

    const interview = await Interview.create({
      title,
      interviewerId,
      candidateId: candidateId || undefined, // Allow optional assignment
      roomId,
      language,
      duration,
      questionId
    });

    if (candidateId) {
      const Notification = require('../models/Notification');
      const notification = await Notification.create({
        userId: candidateId,
        title: 'New Interview Assigned',
        message: `You have been assigned to: ${title}.`,
        type: 'INFO'
      });
      const io = req.app.get('io');
      if (io) {
        io.to(candidateId).emit('new-notification', notification);
      }
    }

    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create interview' });
  }
};

const getInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let filter = {};
    if (role === 'interviewer') {
      filter.interviewerId = userId;
    } else {
      filter.candidateId = userId;
    }

    const interviews = await Interview.find(filter).populate('questionId');
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
};

const getInterviewByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const interview = await Interview.findOne({ roomId }).populate('questionId');
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.status(200).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview details' });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.status(200).json({ message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete interview' });
  }
};

const getCandidateStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const Submission = require('../models/Submission');
    
    const upcomingCount = await Interview.countDocuments({ candidateId: userId, status: 'scheduled' });
    const completedInterviews = await Interview.find({ candidateId: userId, status: 'completed' });
    const completedCount = completedInterviews.length;

    const submissions = await Submission.find({ candidateId: userId });
    
    let totalScore = 0;
    let successCount = 0;
    submissions.forEach(sub => {
      totalScore += (sub.score || 0);
      if (sub.score >= 70) successCount++;
    });
    
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
    const successRate = completedCount > 0 ? Math.round((successCount / completedCount) * 100) : 0;

    res.status(200).json({
      upcomingCount,
      completedCount,
      averageScore,
      successRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch candidate stats' });
  }
};

module.exports = { createInterview, getInterviews, getInterviewByRoomId, deleteInterview, getCandidateStats };
